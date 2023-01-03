const linearAlgebra = require('linear-algebra')();
const Matrix = linearAlgebra.Matrix;

const topsis = require('topsis');

let m = new Matrix(arrayMatrix);
// m argument is the alternative matrix. Each row is an alternative and each column is a criterion.

let w = array_w;  // This argument indicates the weights of each criteria.
let ia = array_ia; // This argument indicates if a criterion is beneficial or not.


console.log(topsis.getBest(m, w, ia));