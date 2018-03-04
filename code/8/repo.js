const fs = require('fs');

class Repo{
  constructor(){
    this._u = []; //unallocated {start, size}
  }

  /**
   * 
   * @param {number} size 
   * @param {number?} pos 
   */
  allocate(size){
    if (size < 1){
      throw new Error(`Invalid allocation size ${size}`);
    }

    // Find an unallocated chunk of which will fit the request
    // Pick the one of which best fits the request (Tightest fit)
    let b = -1;
    search: for (let i=0; i<this._u.length; i++){
      if (b == -1){
        b = i;
      }

      // If the spot fits perfectly, then there will be no better option
      if (this._u[i].size === size){
        b = i;
        break search;
      }

      if (this._u[i].size >= size && this._u[i].size < this._u[b].size){
        b = i;
      }
    }

    // If there was a suitable spot
    if (b != -1){
      let pos = this._u[b].start;

      if (this._u[b].size === size){ // Since the segment will fill the entire space, wipe it's reference as unallocated
        this._u.splice(b, 1);
      }else{                         // Remove a section from the unallocated segment
        this._u.start += size;
        this._u.size -= size;
      }

      return pos;
    }

    // There is empty space currently in the repo to store the segment
    pos = this.length;
    this.expand(size);

    // Allocate a segment of the new data
    let i = this._.u.length-1;
    this._.u[i].start += size;
    this._.u[i].size -= size;

    return pos;

  }
  unallocate(start, end){
    let size = end - start;
    if (size < 1){
      throw new Error(`Invalid unallocation of size ${size}, ${start}-${end}`);
    }

    let found = false;
    search: for (let i=0; i<this._u.length; i++){
      let s = this._u[i].start;
      let e = s + this._u[i].size;

      // Does this segment collide with the goal unallocation
      if (
        (start < s && end > s) || // Starts before, but collides
        (start > e && end > e) || // Starts after, but collides
        (start < s && end < e)    // In the middle of the segment
      ){
        // Resize the pointers to fit
        s = Math.min(s, start);
        e = Math.max(e, end);

        this._u[i].start = s;
        this._u[i].size = e - s;

        found = true;
        break search;
      }
    }


    // The new unallocation didn't expand any existing ones
    // Then make a new unallocated segment
    if (!found){
      this._u.push({
        start: start,
        size: end - start
      });
    }else{ // Expanding of segments may of made collisions between existing segments

      // Sort the segments, since adjacent segments would be the onese colliding with each other
      this._u = this._u.sort((a, b)=>{
        if (a.start < b.start){
          return 1;
        }else if (a.start == b.start){
          return 0;
        }else{
          return -1;
        }
      });

      for (let i=0; i<this._u.length-1; i++){
        let s1 = this._u[i].start;
        let e1 = this._u[i].size + s1;
        let s2 = this._u[i+1].start;
        let e2 = this._u[i+1].size + s2;

        // A collision has occured
        if (s2 <= e1){
          this._u[i].start = s1;
          this._u[i].size = Math.max(e2, e1) - s1;

          // Recheck this segment since it may also collide with the next segment
          this._u.splice(i+1, 1);
          i--;
        }
      }
    }
  }
}

class MemRepo extends Repo{
  constructor(){
    super();
    this._s = [new Buffer(65536)];
    this.length = 65536;
  }

  async read(start, end){
    let sp = start % 65536;         // Start point (within chunk)
    let sc = Math.floor(s / 65536); // Start chunk
    let ep = e % 65536;             // End point (within chunk)
    let ec = Math.floor(e / 65536); // End chunk

    // If they are both in the same chunk
    if (sc == ec){
      return this._s.slice(s, e);
    }


    // The desicerd segment is spread across multiple chunks
    let b = Buffer(end, start);
    let ptr = 0;

    b.write(this._s[sc].slice(sp), ptr);
    ptr += this._s[sc].length - s;

    // Append intermidiary chunks
    for (let i=sc; i<ec; i++){
      b.write(this.s[i], ptr);
      ptr += this.s[i].length;
    }

    // Append traing segment
    b.write(this._s[ec].slice(0, ep), ptr);

    return b;
  }
  async write(data, start){
    let ptr = 0;
    let c = Math.floor(start/65536);
    let off = start - c;
    let nx = 65536-off

    this._s.write(data.slice(ptr, nx), off);
    ptr = nx;

    while (ptr < data.length){
      c += 1;
      nx = Math.min(data.length-ptr, 65536);

      this._s[c].write(data.slice(ptr, nx), 0);
      ptr = nx;
    }

    return;
  }
  async expand(size){
    let r = Math.ceil(size/65536); // Expand in 64KB sized chunks
    for (let i=0; i<r; i++){
      this._store.push(Buffer(65536));
      this.length += 65536;
    }

    return;
  }
}

class StoreRepo extends Repo{
  constructor(path){
    super();
    this.path = path;

    let stats = fs.statSync(this.path);
    if (!stats || !stats.size){
      throw new Error(`Invalid file ${this.path}`);
    }
    this.length = stats.size;
  }

  read(start, stop){
    return new Promise((res)=>{
      let s = fs.createReadStream(this.path, {
        start: start,
        highWaterMark: stop - start
      });
      s.on('data', (c)=>{
        res(c);
        s.close();
      });
      s.on('end', ()=>{
        throw new Error(`Invalid read "${this.path}" ${start}-${end}, insufficent amount of data to be read`);
      });
    })
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
  expand(size){
    return new Promise((res)=>{
      size = Math.ceil(size / 1048576); //By MBs

      fs.appendFile(this.path, Buffer(size), (err)=>{
        if (err){
          throw err;
        }

        res();
      })
    });
  }
}

module.exports = {
  ram: MemRepo,
  file: StoreRepo

}