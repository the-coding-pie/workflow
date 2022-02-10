// function getRankBetween(firstRank: string, secondRank: string): string {
//   while (firstRank.length !== secondRank.length) {
//     if (firstRank.length > secondRank.length) {
//       secondRank += "a";
//     } else {
//       firstRank += "a";
//     }
//   }

//   let firstPositionCodes: any[] = [];
//   firstPositionCodes = [...firstPositionCodes, firstRank.codePointAt(0)];

//   let secondPositionCodes: any[] = [];
//   secondPositionCodes = [...secondPositionCodes, firstRank.codePointAt(0)];

//   let difference = 0;

//   for (let index = firstPositionCodes.length - 1; index >= 0; index--) {
//     let firstCode = firstPositionCodes[index];
//     let secondCode = secondPositionCodes[index];

//     /// i.e. ' a < b '
//     if (secondCode < firstCode) {
//       /// ALPHABET_SIZE = 26 for now
//       secondCode += 26;
//       secondPositionCodes[index - 1] -= 1;
//     }

//     const powRes = 26 ** firstRank.length - index - 1;
//     difference += (secondCode - firstCode) * powRes;
//   }

//   let newElement = "";
//   if (difference <= 1) {
//     newElement = firstRank + String.fromCharCode("a".codePointAt(0)! + 26 / 2);
//   } else {
//     difference /= 2;

//     let offset = 0;

//     for (let index = 0; index < firstRank.length; index++) {
//       const diffInSymbols = (difference / 26 ** index) % 26;

//       let newElementCode =
//         firstRank.codePointAt(secondRank.length - index - 1)! +
//         diffInSymbols +
//         offset;
//       offset = 0;

//       if (newElementCode > 'z'.co)
//     }
//   }
// }
