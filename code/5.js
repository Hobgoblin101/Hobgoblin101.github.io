let chars = 'abcdefghijklmnopqrstuvwxyz';

function encode(str, modulo){
  str = str.toLowerCase();
  let res = chars.indexOf(str[0])+1;

  for (let i=1; i<str.length; i++){
    res = (res * chars.indexOf(str[i])+1) % modulo;
  }

  return res;
}


function Test(modulo){
  // Test a few names
  let names = ['Alex', 'Anthony', 'Carla', 'Casandra', 'Jaxon', 'Jackson', 'Jack', 'Jimmy', 'Jim', 'John'];
  let used = [];
  let bad = 0;
  let i=0;
  for (let name of names){
    let val = encode(name, modulo);

    if (used[val] == true){
      bad += 1;
    }

    used[val] = true;
    i++;
  }

  return bad;
}


let smallest = -1;
let si = 0;
for (let i=0; i<=11760001; i++){
  let val = Test(i);

  if (val === 0){
    console.log(i);
    break;
  }

  if (smallest == -1 || val < smallest){
    smallest = val;
    si = i;
    console.log('new', si, smallest)
  }
}