const prompt = require("prompt-sync")();

const migrate = require("./migrate");

const dbName = "aabd-carolina";
const dbUri = `http://localhost:5984/`;
const listQueries = `
    - GET ${dbUri}${dbName}/_all_docs \n

    - GET ${dbUri}${dbName}/{_id} \n

    - PUT ${dbUri}${dbName}/{_id}?rev={_rev}
      {
        document: your_document
      }\n
    
    - DELETE ${dbUri}${dbName}/{_id}?rev={_rev} \n

    - POST ${dbUri}${dbName}/_find
      { 
        "selector": { "vote_percentage.positive": { "$gt": 50 } },
        "fields": ["vote_percentage", "news.title", "author.name"] 
      }\n

    - POST ${dbUri}${dbName}/_find
      {
        "selector": {"$or": [{"news.location": "California"}, {"news.location": "New York"}]},
        "fields": ["news.title", "news.location"]
      }\n

    - POST ${dbUri}${dbName}/_find
      {
        "selector": {"$and": [{"news.location": "California"}, {"news.domain": "education"}]},
        "fields": ["news.title", "news.location", "news.domain"]
      }\n

    - POST ${dbUri}${dbName}/_find
      {
        "selector": {"$nor": [{"author.gender": "male"}]},
        "fields": ["author", "news"]
      }\n

    - POST ${dbUri}${dbName}/_find
      {
        "selector": {"against_arguments": { "$size": 1 }},
        "fields": ["author", "news", "against_arguments"]
      }\n

    - COPY ${dbUri}${dbName}/{_id}
      Destination: new_copied_id
`;

const main = async () => {
  console.clear();
  let number = 0;
  while (number != 3) {
    console.log("\nComandos:");
    console.log("  1 - (Re)Criar banco de dados");
    console.log("  2 - Listar queries");
    console.log("  3 - Sair\n");
    number = prompt("Selecione um comando:  ");

    switch (number) {
      case "1":
        console.clear();
        await migrate();
        break;
      case "2":
        console.clear();
        console.log(listQueries);
        break;
      case "3":
        console.log("\nTchau tchau :D");
        break;
      default:
        console.log("\n Comando inválido, por favor selecione um número correto.");
        break;
    }
  }
};

main();
