const SUBJECT_MESSAGES: Record<string, string> = {
  'Matemática': '🎯 Continue explorando os números e suas aplicações!',
  'Física': '⚡ Descubra as leis que governam o universo!',
  'Química': '🧪 Explore as reações que transformam o mundo!',
  'Biologia': '🌱 Aprenda sobre a vida em todas suas formas!',
  'História': '📚 Descubra as histórias que moldaram nossa civilização!',
  'Geografia': '🌍 Explore nosso planeta e suas maravilhas!',
  'Português': '📖 Domine a língua e suas nuances!',
  'Inglês': '🌐 Abra portas para o mundo com o inglês!',
  'Filosofia': '🤔 Questione, pense e descubra a sabedoria!',
  'Sociologia': '👥 Entenda a sociedade e suas dinâmicas!',
  'Psicologia': '🧠 Explore a mente humana e seus mistérios!',
  'Artes': '🎨 Expresse sua criatividade e sensibilidade!',
  'Educação Física': '🏃‍♂️ Mantenha-se ativo e saudável!',
  'Informática': '💻 Domine a tecnologia do futuro!',
  'Outros': '📚 Continue sua jornada de aprendizado!'
};

export function getFinalLineBySubject(subject: string): string {
  // Normalize subject name
  const normalizedSubject = subject.trim();
  
  // Return subject-specific message or fallback
  return SUBJECT_MESSAGES[normalizedSubject] || SUBJECT_MESSAGES['Outros'];
}

export function getAllSubjectMessages(): Record<string, string> {
  return SUBJECT_MESSAGES;
}

export function getRandomFinalMessage(): string {
  const messages = Object.values(SUBJECT_MESSAGES);
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
