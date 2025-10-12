import fs from 'fs/promises';
import path from 'path';

export async function loadTIResources(): Promise<{
  framework: string;
  playbooks: any;
}> {
  try {
    const frameworkPath = path.join(process.cwd(), 'lib/prompts/ti-framework.json');
    const playbooksPath = path.join(process.cwd(), 'lib/prompts/ti-playbooks.json');

    const [frameworkData] = await Promise.all([
      fs.readFile(frameworkPath, 'utf-8')
    ]);

    const framework = JSON.parse(frameworkData);

    // Framework TI estruturado para respostas JSON - HIPER DIRETO
    const tiFramework = `INSTRUÇÃO FINAL: Para QUALQUER pergunta sobre problemas técnicos, você DEVE responder EXATAMENTE assim:

{"problema":"descrição do problema","status":"ativo","etapas":[{"id":1,"titulo":"titulo do primeiro passo","descricao":"descrição detalhada","comando":null,"status":"pendente","validacao":"como verificar"}],"proxima_acao":"instrução para usuário"}

NÃO adicione NADA antes ou depois. APENAS o JSON. Sem texto, sem emojis, sem markdown.

EXEMPLO para "pc lento":
{"problema":"Computador funcionando devagar","status":"ativo","etapas":[{"id":1,"titulo":"Reinicializar","descricao":"Feche programas e reinicie","comando":null,"status":"pendente","validacao":"Verificar se melhorou"}],"proxima_acao":"Execute o primeiro passo"}`.trim();

    return {
      framework: tiFramework,
      playbooks: {}
    };
  } catch (error) {
    console.error('Error loading TI resources:', error);
    return {
      framework: '',
      playbooks: {}
    };
  }
}

export async function loadSocialMediaResources(): Promise<{
  framework: string;
}> {
  try {
    const frameworkPath = path.join(process.cwd(), 'lib/prompts/social-media-framework.json');

    const frameworkData = await fs.readFile(frameworkPath, 'utf-8');
    const framework = JSON.parse(frameworkData);

    // Extrair apenas o system_prompt do framework
    const socialMediaFramework = framework.system_prompt || '';

    return {
      framework: socialMediaFramework
    };
  } catch (error) {
    console.error('Error loading Social Media resources:', error);
    return {
      framework: ''
    };
  }
}

