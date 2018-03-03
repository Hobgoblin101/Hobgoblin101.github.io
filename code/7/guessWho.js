let DBMS = require('./RDBMS.js');

//Table of all people
let tblPeople = new DBMS('tblPeople', './data/people.dat');
tblPeople.field('name', 'string', 25);

//Table of all questions
let tblQuestion = new DBMS('tblQuestion', './data/question.dat');
tblQuestion.field('prompt', 'string', 45);

//Table linking people to matching questions (Only True cases)
let tblMatch = new DBMS('tblMatch', './data/match.dat');
tblMatch.link(tblPeople);
tblMatch.link(tblQuestion);
tblMatch.field('person', '#tblPeople');
tblMatch.field('question', '#tblQuestion');




// Setup initial information
function firstTime(){

  // Setup people
  let person = tblPeople.tuple();
  person.data = {
    name: 'Kevin Baccon'
  }
  tblPeople.set(0, person);

  person.data.name = 'Bill Gates';
  tblPeople.set(1, person);

  person.data.name = 'Uma Thurman';
  tblPeople.set(2, person);

  person.data.name = 'Maddona';
  tblPeople.set(3, person);



  // Setup Questions
  let question = tblQuestion.tuple();
  question.data = {
    prompt: 'Are they male?'
  }
  tblQuestion.set(0, question);

  question.data.prompt = 'Are they an actor?';
  tblQuestion.set(1, question);

  question.data.prompt = 'Are they female?';
  tblQuestion.set(2, question);



  // Setup links
  let link = tblMatch.tuple();

  // Kevin Baccon is male
  link.data = {person: 0,question: 0}
  tblMatch.set(0, link);

  // Kevin Baccon is an actor
  link.data.person = 0;
  link.data.question = 1;
  tblMatch.set(1, link);

  // Bill Gates is male
  link.data.person = 1;
  link.data.question = 0;
  tblMatch.set(2, link);

  // Uma is female
  link.data.person = 2;
  link.data.question = 2;
  tblMatch.set(3, link);

  // Uma is an Actor
  link.data.person = 2;
  link.data.question = 1;
  tblMatch.set(4, link);

  // Madona is female
  link.data.person = 3;
  link.data.question = 2;
  tblMatch.set(5, link);
}

async function init(){  
  let rules = [
    {id: 1, value: true},
  ];

  let res = await FindMatches(rules);
  let nx = FindQuestions(res, rules);

  console.log(nx);
}

function FindMatches(rules){
  return new Promise((res, rej)=>{
    let people = {};
    let removed = [];

    tblMatch.forEach((t)=>{ // Read all matches and store their values in ram
      
      // Ingore people previously deemed invalid
      if (removed.indexOf(t.data.person.index) != -1){
        return;
      }

      scan: for (let rule of rules){

        // If the rule's are the same
        if (rule.id == t.data.question.index){
          if (rule.value === false){ // If the rule matches, but it shouldn't

            // The person must be invalid,
            // Remove them
            // Make sure they will not return
            delete people[t.data.person.index];
            removed.push(t.data.person.index);

            break scan;
          }
        }

        // State that this person follows this rule
        if (!people[t.data.person.index]){
          people[t.data.person.index] = {};
        }
        people[t.data.person.index][t.data.question.index] = true;
      }
    }, ()=>{                // Now that the read has ended
      delete removed; // Help the garbage collector

      // Check if any person is missing a rule
      outer: for (let key in people){
        inner: for (let rule of rules){

          // This case has already been accounted for during the read
          if (rule.value != true){
            continue inner;
          }

          // Remove the person if they aren't true for one of the rules
          if (!people[key][rule.id]){
            delete people[key];
            continue outer;
          }
        }
      }

      res(people);
    });
  })
}

function FindQuestions(people){
  let count = [];
  let num = Object.keys(people).length;

  // Count the number of people per question
  outer: for (let key in people){
    inner: for (let qID in people[key]){

      // Add one to the correct tuple in count
      search: for (let opt of count){
        if (opt.id == qID){
          opt.num += 1;
          continue inner;
        }
      }
      // If there isn't a tuple for this ID, make one
      count.push({id: qID, num: 1, val: 0});
    }
  }

  console.log(1, count);

  // Calculate the divide between have and have not for this question
  for (let opt in count){
    console.log(count[opt]);
    //                       (       have not      ) (     have     )
    count[opt].val = Math.abs( num - count[opt].num - count[opt].num );
  }

  count = count.sort((a, b)=>{
    if (a.val == b.val){
      return 0;
    }else if (a.val > b.val){
      return -1;
    }else{
      return 1;
    }
  });

  return count;
}





// Build all tables
tblPeople.build().then(()=>{
  tblQuestion.build().then(()=>{
    tblMatch.build().then(()=>{
      init();
    })
  });
});