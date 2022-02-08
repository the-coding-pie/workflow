export class Lexorank {
    MIN_CHAR: number = this.byte('0');
    MAX_CHAR: number = this.byte('z');
  
    insert(prev: string, next: string): [string, boolean] {
      if (prev == '') {
        prev = this.string(this.MIN_CHAR);
      }
      if (next == '') {
        next = this.string(this.MAX_CHAR);
      }
  
      let rank: string = '';
      let i: number = 0;
  
      while (true) {
        let prevChar: number = this.getChar(prev, i, this.MIN_CHAR);
        let nextChar: number = this.getChar(next, i, this.MAX_CHAR);
  
        if (prevChar == nextChar) {
          rank += this.string(prevChar);
          i++;
          continue;
        }
  
        let midChar: number = this.mid(prevChar, nextChar);
        if (midChar == prevChar || midChar == nextChar) {
          rank += this.string(prevChar);
          i++;
          continue;
        }
  
        rank += this.string(midChar);
        break;
      }
  
      if (rank >= next) {
        return [prev, false];
      }
      return [rank, true];
    }
  
    string(byte: number): string {
      return String.fromCharCode(byte);
    }
  
    byte(char: string): number {
      return char.charCodeAt(0);
    }
  
    mid(prev: number, next: number): number {
      // TODO: consider to use 8 steps each jump
      return Math.floor((prev + next) / 2); 
    }
  
    getChar(s: string, i: number, defaultChar: number): number {
      if (i >= s.length) {
        return defaultChar;
      }
      return this.byte(s.charAt(i));
    }
  }