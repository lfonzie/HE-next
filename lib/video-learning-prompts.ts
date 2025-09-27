/**
 * Prompts for Video-to-Learning functionality
 */

export const SPEC_FROM_VIDEO_PROMPT = `Você é um pedagogista e designer de produtos com profunda experiência em criar experiências de aprendizado envolventes via aplicações web interativas.

Examine o conteúdo do vídeo anexado. Em seguida, escreva uma especificação detalhada e cuidadosamente considerada para uma aplicação web interativa projetada para complementar o vídeo e reforçar sua(s) ideia(s) principal(is). O destinatário da especificação não tem acesso ao vídeo, então a especificação deve ser completa e autocontida (a especificação não deve mencionar que é baseada em um vídeo). Aqui está um exemplo de uma especificação escrita em resposta a um vídeo sobre harmonia funcional:

"Na música, acordes criam expectativas de movimento em direção a certos outros acordes e resolução em direção a um centro tonal. Isso é chamado de harmonia funcional.

Construa uma aplicação web interativa para ajudar um aprendiz a entender o conceito de harmonia funcional.

ESPECIFICAÇÕES:
1. A aplicação deve apresentar um teclado interativo.
2. A aplicação deve mostrar todos os 7 tríades diatônicas que podem ser criadas em uma tonalidade maior (ou seja, tônica, supertônica, mediante, subdominante, dominante, submediante, acorde de condução).
3. A aplicação deve de alguma forma descrever a função de cada uma das tríades diatônicas, e declarar para quais outros acordes cada tríade tende a levar.
4. A aplicação deve fornecer uma maneira para os usuários tocarem diferentes acordes em sequência e ver os resultados.
[etc.]"

O objetivo da aplicação que será construída com base na especificação é melhorar o entendimento através de design simples e lúdico. A especificação fornecida não deve ser excessivamente complexa, ou seja, um desenvolvedor web júnior deve ser capaz de implementá-la em um único arquivo HTML (com todos os estilos e scripts inline). Mais importante, a especificação deve delinear claramente os mecanismos centrais da aplicação, e esses mecanismos devem ser altamente eficazes em reforçar a(s) ideia(s) principal(is) do vídeo dado.

Forneça o resultado como um objeto JSON contendo um único campo chamado "spec", cujo valor é a especificação para a aplicação web. Certifique-se de que o JSON está bem formatado e não contém caracteres de controle que possam causar problemas de parsing.`

export const CODE_REGION_OPENER = '```'
export const CODE_REGION_CLOSER = '```'

export const SPEC_ADDENDUM = `\n\nA aplicação deve ser totalmente responsiva e funcionar adequadamente tanto em desktop quanto em mobile. Forneça o código como um único documento HTML autocontido. Todos os estilos e scripts devem ser inline. No resultado, coloque o código entre "${CODE_REGION_OPENER}" e "${CODE_REGION_CLOSER}" para fácil análise.`
