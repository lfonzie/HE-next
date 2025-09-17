// lib/neo4j.ts
// Utilitário para conexão e operações com Neo4j

import neo4j from 'neo4j-driver';

// Configuração da conexão
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

// Criar driver do Neo4j
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

/**
 * Executa uma query Cypher no Neo4j
 * @param {string} query - Query Cypher
 * @param {Object} parameters - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
export async function queryNeo4j(query: string, parameters: Record<string, any> = {}) {
  const session = driver.session();
  
  try {
    const result = await session.run(query, parameters);
    return result.records.map(record => record.toObject());
  } catch (error) {
    console.error('Erro ao executar query Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Salva uma aula completa no Neo4j
 * @param {Object} lessonData - Dados da aula
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} ID da aula salva
 */
export async function saveLessonToNeo4j(lessonData: any, userId: string): Promise<string> {
  const lessonId = lessonData.id || `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const query = `
    MERGE (l:Lesson {id: $lessonId})
    SET l.title = $title,
        l.subject = $subject,
        l.level = $level,
        l.objectives = $objectives,
        l.duration = $duration,
        l.points = $points,
        l.progress = $progress,
        l.createdAt = datetime(),
        l.updatedAt = datetime()
    
    MERGE (u:User {id: $userId})
    MERGE (u)-[:CREATED]->(l)
    
    WITH l
    UNWIND $stages AS stage
    MERGE (s:Stage {id: $lessonId + '_' + stage.etapa})
    SET s.etapa = stage.etapa,
        s.title = stage.title,
        s.type = stage.type,
        s.completed = stage.completed,
        s.points = stage.points,
        s.content = stage.content,
        s.questions = stage.questions,
        s.imageUrl = stage.imageUrl,
        s.imagePrompt = stage.imagePrompt,
        s.route = stage.route,
        s.estimatedTime = stage.estimatedTime,
        s.createdAt = datetime(),
        s.updatedAt = datetime()
    
    MERGE (l)-[:HAS_STAGE]->(s)
    
    RETURN l.id as lessonId
  `;
  
  const parameters = {
    lessonId,
    title: lessonData.title,
    subject: lessonData.subject,
    level: lessonData.level,
    objectives: JSON.stringify(lessonData.objectives || []),
    duration: lessonData.duration || 'N/A min',
    points: lessonData.points || 0,
    progress: lessonData.progress || '0/14 etapas, 0%',
    userId,
    stages: lessonData.stages || []
  };
  
  try {
    const result = await queryNeo4j(query, parameters);
    return result[0]?.lessonId || lessonId;
  } catch (error) {
    console.error('Erro ao salvar aula no Neo4j:', error);
    throw error;
  }
}

/**
 * Atualiza o progresso de uma etapa da aula
 * @param {string} lessonId - ID da aula
 * @param {number} etapa - Número da etapa
 * @param {boolean} completed - Se a etapa foi concluída
 * @param {number} points - Pontos ganhos
 * @returns {Promise<void>}
 */
export async function updateLessonProgress(lessonId: string, etapa: number, completed: boolean, points: number = 0): Promise<void> {
  const query = `
    MATCH (l:Lesson {id: $lessonId})-[:HAS_STAGE]->(s:Stage {etapa: $etapa})
    SET s.completed = $completed,
        s.points = $points,
        s.updatedAt = datetime()
    
    WITH l
    MATCH (l)-[:HAS_STAGE]->(s:Stage)
    WITH l, count(s) as totalStages, count(CASE WHEN s.completed THEN 1 END) as completedStages
    SET l.progress = toString(completedStages) + '/' + toString(totalStages) + ' etapas, ' + 
                    toString(round(completedStages * 100.0 / totalStages)) + '%',
        l.updatedAt = datetime()
  `;
  
  const parameters = {
    lessonId,
    etapa,
    completed,
    points
  };
  
  try {
    await queryNeo4j(query, parameters);
  } catch (error) {
    console.error('Erro ao atualizar progresso da aula:', error);
    throw error;
  }
}

/**
 * Busca uma aula por ID
 * @param {string} lessonId - ID da aula
 * @returns {Promise<Object|null>} Dados da aula ou null se não encontrada
 */
export async function getLessonFromNeo4j(lessonId: string): Promise<any | null> {
  const query = `
    MATCH (l:Lesson {id: $lessonId})
    OPTIONAL MATCH (l)-[:HAS_STAGE]->(s:Stage)
    RETURN l, collect(s) as stages
  `;
  
  const parameters = { lessonId };
  
  try {
    const result = await queryNeo4j(query, parameters);
    if (result.length === 0) return null;
    
    const lesson = result[0].l.properties;
    const stages = result[0].stages.map((stage: any) => stage.properties);
    
    return {
      ...lesson,
      stages: stages.sort((a: any, b: any) => a.etapa - b.etapa)
    };
  } catch (error) {
    console.error('Erro ao buscar aula no Neo4j:', error);
    throw error;
  }
}

/**
 * Lista todas as aulas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de aulas
 */
export async function getUserLessonsFromNeo4j(userId: string): Promise<any[]> {
  const query = `
    MATCH (u:User {id: $userId})-[:CREATED]->(l:Lesson)
    OPTIONAL MATCH (l)-[:HAS_STAGE]->(s:Stage)
    RETURN l, collect(s) as stages
    ORDER BY l.createdAt DESC
  `;
  
  const parameters = { userId };
  
  try {
    const result = await queryNeo4j(query, parameters);
    return result.map((record: any) => {
      const lesson = record.l.properties;
      const stages = record.stages.map((stage: any) => stage.properties);
      
      return {
        ...lesson,
        stages: stages.sort((a: any, b: any) => a.etapa - b.etapa)
      };
    });
  } catch (error) {
    console.error('Erro ao buscar aulas do usuário:', error);
    throw error;
  }
}

/**
 * Fecha a conexão com o Neo4j
 */
export async function closeNeo4jConnection(): Promise<void> {
  await driver.close();
}

// Exportar driver para uso direto se necessário
export { driver };
