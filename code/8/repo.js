class RepoRAM{
  constructor(){
    this.size = 64*1024; // 64KB
    this.chunkSize = this.size;

    this.chunks = [];
  }

  /**
   * Expand the storage space
   * @param {number} size Minimum expansion amount
   */
  expand(size){
    if (size < 1){
      size = 1;
    }

    while (size > 0){
      this.chunks.push(Buffer(this.chunkSize));

      this.size += this.chunkSize;
      size -= this.chunkSize;
    }
  }

  async read(s, e){
    let res = Buffer(e-s);
    let ptr = 0;
    let i=0;

    while (e > 0){
      if (e < this.chunkSize){
        res.write(this.chunk[i].slice(0, e));
        return res;
      }else if (s < 0){
        res.write(this.chunk[i], ptr);
        ptr += this.chunkSize;
      }else if (s < this.chunkSize){
        if (e < this.chunkSize){
          return this.chunks[i].slice(s, e);
        }

        res.write(this.chunks[i].slice(s), 0);
        ptr += this.chunkSize - s;
      }

      e -= this.chunkSize;
      s -= this.chunkSize;
      i++;
    }
  }
  async write(s, e, data){
    let ptr = 0;
    let nx = 0;
    let i=0;

    while (ptr < data.length){
      if (s < this.chunkSize){
        nx = ptr + this.chunkSize-s;
        this.chunks[i].write(data.slice(ptr, nx), s);
        ptr = nx;
      } else if (s < 0){
        nx = ptr + this.chunkSize;

        this.chunks[i].write(data.slice(ptr, nx), 0);
        ptr = nx;
      }
      
      s -= this.chunkSize;
      i++;
    }
  }
}


const fs = require('fs');
class RepoStore{
  constructor(path){
    if (!fs.existsSync(path)){
      throw new ReferenceError(`Invalid storage path "${path}"`);
    }

    let stats = fs.lstatSync();
    if (!stats || !stats.size){
      throw new ReferenceError(`Invalid file path "${path}"\n\tPointer is not a file`);
    }
    this.size = stats.size;
  }

  expand(size){
    return new Promise((res)=>{
      size = Math.ceil(size / 65536) * 65536;
      let t = Buffer(size);

      fs.appendFile(t, (err)=>{
        if (err){
          throw err;
        }

        res();
      });
    });
  }

  read(s,e){
    return new Promise((res)=>{
      let s = fs.createReadStream(this.path, {
        start: s,
        highWaterMark: e-s
      });
      s.on('data', (c)=>{
        res(c);
        s.close()
      });
    });
  }

  write(data, start){
    return new Promise((res)=>{
      let s = fs.createWriteStream(this.path, {
        start: start,
        flags: 'r+'
      });
      s.write(data, ()=>{
        res();
      });
      s.close();
    })
  }
}