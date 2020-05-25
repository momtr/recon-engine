// Apriori - Example
// Mitterdorfer, 2020

let data;
let els = [];
let apriori;

function preload() {
    /** we use the shopping dataset of shopping baskets */
    data = loadTable('data/shopping.csv');
}

async function setup() {
    noCanvas(); 
    for(let i of data.rows) {
        els.push(i.arr);
    }
    apriori = new Apriori(els, 8, 0.6);
    let expand = await apriori.getRules();
    console.log(expand);
}