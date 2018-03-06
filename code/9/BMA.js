// Buddy Memeory Allocation
class BMA{
  constructor(parent, size = 32768){
    if (Math.floor(size) !== size){
      throw new Error(`Cannot include fraction sizes ${size}`);
    }

    this.parent = parent;
    this.a = false;
    this.b = false;
    this.size = size;
  }

  /**
   * Set the polarity of the selected area
   * @param {number} s 
   * @param {number} e 
   * @param {boolean} val 
   */
  set(s, e, val){
    if (s > e){
      throw new Error(`Invalid SET range ${s}=${e}`);
    }

    val = val == true;
    let size = e - s;

    // Fills sect A
    if (s == 0 && e == this.size){
      this.a = val;
      if (this.b == val && this.parent){
        this.parent.merge(this);
      }
      return this;
    }

    // Fills sect B
    if (s == this.size && e == this.size + this.size){
      this.b = val;
      if (this.a == val && this.parent){
        this.parent.merge(this);
      }
      return this;
    }

    // Collides with sect A
    // AND changing the value
    if (s < this.size && this.a != val){
      if (!(this.a instanceof BMA)){
        let was = this.a;
        this.a = new BMA(this, this.size/2);
        this.a.a = this.a.b = was;
      }
      this.a.set(s, Math.min(this.size, e), val);
    }

    // Collides with sect B
    // AND changes the value
    if (e > this.size && this.b != val){
      s -= this.size;
      e -= this.size;

      if (!(this.b instanceof BMA)){
        let was = this.b;
        this.b = new BMA(this, this.size/2);
        this.b.a = this.b.b = was;
      }
      this.b.set(Math.max(0, s), e, val);
    }

    // If both branches are the same then this branch is irrelevent
    if (this.parent && this.a == this.b){
      this.parent.merge(this);
    }
  }

  /**
   * Find the polarity of the selected area
   * @param {number} s Start
   * @param {number} e End
   * @returns {number} [-1,0,1] = [False,Mix,True]
   */
  get(s,e){
    if (s > e){
      throw new Error(`Invalid Get range ${s}=${e}`);
    }

    // Not in sect B
    if (s < this.size && e <= this.size){
      if (this.a instanceof BMA){
        return this.a.get(s, e);
      }
      return this.a ? 1 : -1;
    }

    // Not in sect A
    if (s > this.size){
      if (this.b instanceof BMA){
        return this.b.get(
          s-this.size,
          e-this.size
        );
      }
      return this.b ? 1 : -1;
    }



    // Collision with A
    let a = 0;
    if (this.a instanceof BMA){
      a = this.a.get(s, Math.min(this.size, e));
    }else{
      a = this.a ? 1 : -1;
    }

    if (a == 0){
      return 0;
    }

    // Collision with B
    let b = 0;
    if (this.b instanceof BMA){
      b = this.b.get(s-this.size, e-this.size);
    }else{
      b = this.b ? 1 : -1;
    }

    if (b == 0){
      return 0;
    }



    if (a == b){
      return a;
    }else{
      return 0;
    }
  }

  /**
   * FromChild: Tell parent both branches are the same and I am irrelevent
   * @param {BMA} target 
   */
  merge(target){
    if (this.a == target){
      this.a = this.a.a;
    }else{
      this.b = this.b.b;
    }
  }

  /**
   * Recursive function to find a space to fit the request
   * @param {Boolean} val 
   * @param {Number} size 
   */
  hit(val, size){
    if (this.size < size){
      return NaN;
    }

    if (this.a === val){
      return {pos: 0, size: this.size};
    }else if (this.b === val){
      return {pos: this.size, size: this.size};
    }

    let a = NaN;
    if (this.a instanceof BMA){
      a = this.a.hit(val, size);

      // Tight fit found
      // There will not be any better sols
      if (a != NaN && a.size == size){
        return a;
      }
    }
    let b = NaN;
    if (this.b instanceof BMA){
      b = this.b.hit(val, size);

      // Tight fit found
      // There will not be any better sols
      if (b != NaN && b.size == size){
        b.pos += this.size;
        return b;
      }
    }

    // If either option results in a NaN
    let na = isFinite(a) && isNaN(a);
    let nb = !isFinite(b) && isNaN(b);
    if (na && nb){
      return NaN;
    }
    if (nb && !na){
      return a;
    }
    if (na && !nb){
      return b;
    }

    if (a.size < b.size){
      return a;
    }else if (b.size > a.size){
      b.pos += this.size;
      return b;
    }

    throw new Error(`Uncaught Exception\n  a:${a}\n  b:${b}`);
  }
}

class BMAX{
  constructor(length){
    this.root = new BMA();
    this.length = this.root.size*2;
  }

  /**
   * Set the polarity of the selected area
   * @param {number} s 
   * @param {number} e 
   * @param {boolean} val 
   */
  set(s,e, val){
    return this.root.set(s,e,val);
  }
  /**
   * Find the polarity of the selected area
   * @param {number} s Start
   * @param {number} e End
   * @returns {number} [-1,0,1] = [False,Mix,True]
   */
  get(s,e){
    return this.root.get(s,e);
  }

  /**
   * Enlarge the allocation table
   * @param {Number} amount Desired minimal extention
   */
  extend(amount = 1){
    let ol = this.length;
    if (amount < 1){
      amount = 1;
    }

    while (this.length-ol < amount){
      let t = new BMA(undefined, this.length);
      t.a = this.root;
      t.a.parent = t;
      this.root = t;

      this.length = this.root.size*2;
    }
  }

  /**
   * Find an area the size of which is filled with val
   * @param {Number} size 
   * @param {Boolean} val 
   */
  find(size, val){
    return this.root.hit(val == true, size);
  }
}

let root = new BMAX();
// root.extend();
root.set(4, 8, true);

console.log(root.root);

console.log(
  'res', root.find(1, true)
);