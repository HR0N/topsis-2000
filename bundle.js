(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const linearAlgebra = require('linear-algebra')();
const Matrix = linearAlgebra.Matrix;

const topsis = require('topsis');

let m = new Matrix(arrayMatrix);
// m argument is the alternative matrix. Each row is an alternative and each column is a criterion.

let w = array_w;  // This argument indicates the weights of each criteria.
let ia = array_ia; // This argument indicates if a criterion is beneficial or not.


console.log(topsis.getBest(m, w, ia));
},{"linear-algebra":4,"topsis":5}],2:[function(require,module,exports){
(function (root, factory) {
  "use strict";

  // AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  // CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory();
  }
  // Browser
  else {
    root.linearAlgebra = factory();
  }
})(this, function () {
  "use strict";


  var _throwError = function(msg) {
    throw new Error('linear-algebra: ' + msg);
  };


  var _throwSizeMismatchError = function(op, arg1, arg2) {
    _throwError('[' + op + '] op1 is ' + arg1.rows  + ' x ' + arg1.cols + 
      ' and op2 is ' + arg2.rows + ' x ' + arg2.cols);
  };


  /**
   * Initialise the linear algebra library.
   *
   * @param {Object} options Additional options.
   * @param {Function} [options.add] Function to add floating point numbers.
   * 
   * @return {Object} Linear algebra primitives.
   */
  return function(options) {
    options = options || {};

    
  var LinAlg = {};


  /**
   * Our common number array class.
   *
   * @param {Array} values 1D array (vector) or 2D array (matrix) with length >= 1.
   * 
   * @constructor
   */
  var Matrix = LinAlg.Matrix = function(values) {
    if (Array.isArray(values[0])) {
      // matrix
      this.data = values;
      this.rows = values.length;
      this.cols = values[0].length;
    } else {
      // row-vector
      this.data = [values];
      this.rows = 1;
      this.cols = values.length;
    }
  };




  /**
   * Clone this matrix.
   * @return {Matrix}
   */
  Matrix.prototype.clone = function() {
    return new Matrix(this.toArray());
  };




  /**
   * Get plain array version of this matrix.
   * 
   * @return {Array}
   */
  Matrix.prototype.toArray = function() {
    var thisData = this.data,
      rows = this.rows,
      cols = this.cols;

    var a = new Array(rows);

    for (var i = 0; i<rows; ++i) {
      a[i] = thisData[i].slice(0, cols);
    }

    return a;
  };




  /**
   * Create an identity matrix of given dimensions.
   * @param  {Integer} dim Length of one side.
   * @return {Matrix}
   */
  Matrix.identity = function(dim) {
    return Matrix.scalar(dim, 1);
  };




  /**
   * Create a scalar diagonal matrix.
   * @param {Integer} dim Matrix size (length of each side)
   * @param  {Number} entry The value to place in each diagonal.
   * @return {Matrix}
   */
  Matrix.scalar = function(dim, entry) {
    var a = new Array(dim),
      i, j;

    for (i=0; i<dim; ++i) {
      a[i] = new Array(dim);

      for (j=0; j<dim; ++j) {
        a[i][j] = 0;
      }

      a[i][i] = entry;
    }

    return new Matrix(a);
  };




  /**
   * Create a matrix of zeros.
   * @param {Integer} rows Number of rows.
   * @param {Integer} bols Number of bols.
   * @return {Matrix}
   */
  Matrix.zero = function(rows, cols) {
    var a = new Array(rows);

    for (var i=0; i<rows; ++i) {
      a[i] = new Array(cols);
      
      for (var j=0; j<cols; ++j) {
        a[i][j] = 0;
      }
    }
    return new Matrix(a);
  };



  /**
   * Reshape array into matrix.
   * 
   * @param {Array} values 1D array (vector)
   * @param {Number} rows Number of rows.
   * @param {Number} cols Number of cols.
   * 
   * @return {Matrix}
   */
  Matrix.reshapeFrom = function(values, rows, cols) {
    if (values.length !== rows * cols) {
      _throwError('cannot reshape array of length ' + values.length + ' into ' + rows  + 'x' +  cols + ' matrix');
    }

    var a = [];

    for (var i=0; i<values.length; i += cols) {
      a.push(values.slice(i, cols + i));
    }

    return new Matrix(a);
  };




  /**
   * Helpers to create vectors, i.e. matrices with a single row.
   */
  var Vector = LinAlg.Vector = {
    /**
     * Create a row-vector of zeros.
     * @param  {Integer} size Length of vector.
     * @return {Vector}
     */
    zero: function(size) {
      var a = new Array(size);

      for (var i=0; i<size; ++i) {
        a[i] = 0;
      }

      return new Matrix(a);    
    }
  };



/**
 * @fileOverview  Initialization options
 */


// function to add floating point values
if (options.add) {
  console.warn('linear-algebra: adder (options.add) will not be used in non-precision version');
}

/**
 * @fileOverview  Basic arithmetic operations
 */




/**
 * Transpose this matrix.
 * @return {Matrix}
 */
Matrix.prototype.trans = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col;

  var result = new Array(cols);

  for (col=0; col<cols; ++col) {
    result[col] = new Array(rows);
    
    for (row=0; row<rows; ++row) {
      result[col][row] = thisData[row][col];
    }
  }

  return new Matrix(result);
};






/**
 * In-place version of trans().
 * @return this
 */
Matrix.prototype.trans_ = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col, t;

  // first we transpose the matrix upto length of shortest side
  var isSquare = (cols === rows);
  var shortestSide = (cols > rows) ? rows : cols;

  for (row=0; row<shortestSide; ++row) {
    for (col=row + 1; col<shortestSide; ++col) {
      t = thisData[col][row];
      thisData[col][row] = thisData[row][col];
      thisData[row][col] = t;
    }
  }

  // now we transpose the rest of the matrix
  if (!isSquare) {
    if (cols > rows) {
      // do a column at a time
      for (col=rows; cols > col; ++col) {
        if (!Array.isArray(thisData[col])) {
          thisData[col] = new Array(rows);
        }

        for (row=0; row<rows; ++row) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    else {
      // do a row at a time
      for (row=cols; rows > row; ++row) {
        for (col=0; cols > col; ++col) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    
    // finally, we update the "official" dimensions
    t = rows;
    this.rows = cols;
    this.cols = t;
  }


  return this;
};



Matrix.prototype.div = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.div_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.mul = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.mul_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.plus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.plus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.minus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.minus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return this;
};











/**
 * Dot product.
 * 
 * @param  {Matrix} arg A Matrix.
 * 
 * @return {Matrix}
 */
Matrix.prototype.dot = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2;

  var result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols2);

    for (col2=0; col2<cols2; ++col2) {
      result[row][col2] = 0;

      for (row2=0; row2<rows2; ++row2) {
        result[row][col2] += thisData[row][row2] * op2Data[row2][col2];
      }
    }
  }  

  return new Matrix(result);
};




/**
 * In-place version of dot().
 * 
 * @return this
 */
Matrix.prototype.dot_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot_', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2, tmp;

  for (row=0; row<rows; ++row) {
    // we need to keep a copy of this row since we'll be overwriting it in this.data
    tmp = thisData[row].slice(0, cols);

    for (col2=0; col2<cols2; ++col2) {
      thisData[row][col2] = 0;

      for (row2=0; row2<rows2; ++row2) {
        thisData[row][col2] += tmp[row2] * op2Data[row2][col2];
      }
    }
  }  

  // update dimensions
  this.cols = cols2;

  return this;
};




Matrix.prototype.getSum = function() {
 var thisData = this.data,
   rows = this.rows,
   cols = this.cols;

 var sum = 0;

 for (var i = 0; i<rows; ++i) {
   for (var j = 0; j<cols; ++j) {
     sum += thisData[i][j];
   }
 }
 
 return sum;  
};


/**
 * Apply function to all elements in this matrix.
 *
 * @param {Function} transformFn With signature (double) => double
 */
Matrix.prototype.map = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.map_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the natural log (ln) all the elements.
 */
Matrix.prototype.log = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.log_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the sigmoid function of all the elements.
 *
 * See http://en.wikipedia.org/wiki/Sigmoid_function
 */
Matrix.prototype.sigmoid = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.sigmoid_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return this;
};





/**
 * Multiply every element with given value.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.mulEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.mulEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * value;
    }
  }  

  return this;
};






/**
 * Add a value to every element.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.plusEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.plusEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + value;
    }
  }  

  return this;
};





/**
 * Apply function with row and column parameters to all elements in matrix
 *
 * Used to apply different transformations depending on placement in matrix.
 */
Matrix.prototype.eleMap = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.eleMap_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return this;
};







    return LinAlg;
  };
});


},{}],3:[function(require,module,exports){
(function (root, factory) {
  "use strict";

  // AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  // CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory();
  }
  // Browser
  else {
    root.linearAlgebra = factory();
  }
})(this, function () {
  "use strict";


  var _throwError = function(msg) {
    throw new Error('linear-algebra: ' + msg);
  };


  var _throwSizeMismatchError = function(op, arg1, arg2) {
    _throwError('[' + op + '] op1 is ' + arg1.rows  + ' x ' + arg1.cols + 
      ' and op2 is ' + arg2.rows + ' x ' + arg2.cols);
  };


  /**
   * Initialise the linear algebra library.
   *
   * @param {Object} options Additional options.
   * @param {Function} [options.add] Function to add floating point numbers.
   * 
   * @return {Object} Linear algebra primitives.
   */
  return function(options) {
    options = options || {};

    
  var LinAlg = {};


  /**
   * Our common number array class.
   *
   * @param {Array} values 1D array (vector) or 2D array (matrix) with length >= 1.
   * 
   * @constructor
   */
  var Matrix = LinAlg.Matrix = function(values) {
    if (Array.isArray(values[0])) {
      // matrix
      this.data = values;
      this.rows = values.length;
      this.cols = values[0].length;
    } else {
      // row-vector
      this.data = [values];
      this.rows = 1;
      this.cols = values.length;
    }
  };




  /**
   * Clone this matrix.
   * @return {Matrix}
   */
  Matrix.prototype.clone = function() {
    return new Matrix(this.toArray());
  };




  /**
   * Get plain array version of this matrix.
   * 
   * @return {Array}
   */
  Matrix.prototype.toArray = function() {
    var thisData = this.data,
      rows = this.rows,
      cols = this.cols;

    var a = new Array(rows);

    for (var i = 0; i<rows; ++i) {
      a[i] = thisData[i].slice(0, cols);
    }

    return a;
  };




  /**
   * Create an identity matrix of given dimensions.
   * @param  {Integer} dim Length of one side.
   * @return {Matrix}
   */
  Matrix.identity = function(dim) {
    return Matrix.scalar(dim, 1);
  };




  /**
   * Create a scalar diagonal matrix.
   * @param {Integer} dim Matrix size (length of each side)
   * @param  {Number} entry The value to place in each diagonal.
   * @return {Matrix}
   */
  Matrix.scalar = function(dim, entry) {
    var a = new Array(dim),
      i, j;

    for (i=0; i<dim; ++i) {
      a[i] = new Array(dim);

      for (j=0; j<dim; ++j) {
        a[i][j] = 0;
      }

      a[i][i] = entry;
    }

    return new Matrix(a);
  };




  /**
   * Create a matrix of zeros.
   * @param {Integer} rows Number of rows.
   * @param {Integer} bols Number of bols.
   * @return {Matrix}
   */
  Matrix.zero = function(rows, cols) {
    var a = new Array(rows);

    for (var i=0; i<rows; ++i) {
      a[i] = new Array(cols);
      
      for (var j=0; j<cols; ++j) {
        a[i][j] = 0;
      }
    }
    return new Matrix(a);
  };



  /**
   * Reshape array into matrix.
   * 
   * @param {Array} values 1D array (vector)
   * @param {Number} rows Number of rows.
   * @param {Number} cols Number of cols.
   * 
   * @return {Matrix}
   */
  Matrix.reshapeFrom = function(values, rows, cols) {
    if (values.length !== rows * cols) {
      _throwError('cannot reshape array of length ' + values.length + ' into ' + rows  + 'x' +  cols + ' matrix');
    }

    var a = [];

    for (var i=0; i<values.length; i += cols) {
      a.push(values.slice(i, cols + i));
    }

    return new Matrix(a);
  };




  /**
   * Helpers to create vectors, i.e. matrices with a single row.
   */
  var Vector = LinAlg.Vector = {
    /**
     * Create a row-vector of zeros.
     * @param  {Integer} size Length of vector.
     * @return {Vector}
     */
    zero: function(size) {
      var a = new Array(size);

      for (var i=0; i<size; ++i) {
        a[i] = 0;
      }

      return new Matrix(a);    
    }
  };



/**
 * @fileOverview  Initialization options for high-precision version
 */


// function to add floating point values
var adder = options.add;

if (!adder) {
  _throwError('options.add must be set for precision calculation');
}

/**
 * @fileOverview  Basic arithmetic operations
 */




/**
 * Transpose this matrix.
 * @return {Matrix}
 */
Matrix.prototype.trans = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col;

  var result = new Array(cols);

  for (col=0; col<cols; ++col) {
    result[col] = new Array(rows);
    
    for (row=0; row<rows; ++row) {
      result[col][row] = thisData[row][col];
    }
  }

  return new Matrix(result);
};






/**
 * In-place version of trans().
 * @return this
 */
Matrix.prototype.trans_ = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col, t;

  // first we transpose the matrix upto length of shortest side
  var isSquare = (cols === rows);
  var shortestSide = (cols > rows) ? rows : cols;

  for (row=0; row<shortestSide; ++row) {
    for (col=row + 1; col<shortestSide; ++col) {
      t = thisData[col][row];
      thisData[col][row] = thisData[row][col];
      thisData[row][col] = t;
    }
  }

  // now we transpose the rest of the matrix
  if (!isSquare) {
    if (cols > rows) {
      // do a column at a time
      for (col=rows; cols > col; ++col) {
        if (!Array.isArray(thisData[col])) {
          thisData[col] = new Array(rows);
        }

        for (row=0; row<rows; ++row) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    else {
      // do a row at a time
      for (row=cols; rows > row; ++row) {
        for (col=0; cols > col; ++col) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    
    // finally, we update the "official" dimensions
    t = rows;
    this.rows = cols;
    this.cols = t;
  }


  return this;
};



Matrix.prototype.div = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.div_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.mul = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.mul_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.plus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.plus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.minus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.minus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return this;
};









/**
 * @fileOverview  High precision version.
 */



/**
 * Dot product.
 * 
 * @param  {Matrix} arg A Matrix.
 * 
 * @return {Matrix}
 */
Matrix.prototype.dot = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2, tmp;

  var result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols2);

    for (col2=0; col2<cols2; ++col2) {
      tmp = new Array(rows2);

      for (row2=0; row2<rows2; ++row2) {
        tmp[row2] = thisData[row][row2] * op2Data[row2][col2];
      }

      result[row][col2] = adder(tmp);
    }
  }  

  return new Matrix(result);
};




/**
 * In-place version of dot()
 * 
 * @return this
 */
Matrix.prototype.dot_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot_', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2, tmp, tmp2;

  for (row=0; row<rows; ++row) {
    // we need to keep a copy of this row since we'll be overwriting it in this.data
    tmp = thisData[row].slice(0, cols);

    for (col2=0; col2<cols2; ++col2) {
      tmp2 = new Array(rows2);

      for (row2=0; row2<op2.rows; ++row2) {
        tmp2[row2] = tmp[row2] * op2Data[row2][col2];
      }

      thisData[row][col2] = adder(tmp2);
    }
  }  

  // update dimensions
  this.cols = cols2;

  return this;
};





/**
 * @fileOverview  High precision version.
 */




/**
 * Sum every element.
 * @return {Number}
 */
Matrix.prototype.getSum = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var sum = new Array(rows * cols);

  for (var i = 0, jBase = 0; i<rows; ++i, jBase += cols) {
    for (var j = 0; j<cols; ++j) {
      sum[jBase + j] = thisData[i][j];
    }
  }
  
  return adder(sum); 
};

/**
 * Apply function to all elements in this matrix.
 *
 * @param {Function} transformFn With signature (double) => double
 */
Matrix.prototype.map = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.map_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the natural log (ln) all the elements.
 */
Matrix.prototype.log = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.log_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the sigmoid function of all the elements.
 *
 * See http://en.wikipedia.org/wiki/Sigmoid_function
 */
Matrix.prototype.sigmoid = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.sigmoid_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return this;
};





/**
 * Multiply every element with given value.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.mulEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.mulEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * value;
    }
  }  

  return this;
};






/**
 * Add a value to every element.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.plusEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.plusEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + value;
    }
  }  

  return this;
};





/**
 * Apply function with row and column parameters to all elements in matrix
 *
 * Used to apply different transformations depending on placement in matrix.
 */
Matrix.prototype.eleMap = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.eleMap_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return this;
};







    return LinAlg;
  };
});


},{}],4:[function(require,module,exports){
var normal = require('./dist/linear-algebra'),
  precision = require('./dist/linear-algebra.precision');


/** 
 * Initialise the library.
 * 
 * @param {Object} options Additional options.
 * @param {Function} [options.add] Function to add floating point numbers.
 * 
 * @return {Object} Linear algebra primitives.
 */
var linearAlgebra = module.exports = function(options) {
  options = options || {};
  
  if (options.add) {
    return linearAlgebra._precision(options);
  } else {
    return linearAlgebra._normal(options);
  }
};


// to make testing easier
linearAlgebra._normal = normal;
linearAlgebra._precision = precision;


},{"./dist/linear-algebra":2,"./dist/linear-algebra.precision":3}],5:[function(require,module,exports){
'use strict'
const linearAlgebra = require('linear-algebra')();

const Matrix = linearAlgebra.Matrix;

// General function to sort JSON array by attribute:
function sortedBy(elm) {
  return function order(a, b) {
    if (b[elm] > a[elm]) {
      return 1;
    } if (b[elm] < a[elm]) {
      return -1;
    }
    return 0;
  };
}

exports.getBest = function getBest(m, w, ia) {
  // ERROR HANDLERS

  if (!(m.data)) {
    console.log('ERROR. Matrix argument MUST be a linear-algebra module matrix.');
    return 'ERROR';
  }

  if (Array.isArray(ia) === false) {
    console.log('ERROR. Impact argument MUST be an array.');
    return 'ERROR';
  }

  if (ia.length !== m.cols) {
    console.log('ERROR. Impact argument size MUST be equal to Alternative Matrix columns size.');
    return 'ERROR';
  }

  if (ia.every(i => typeof i === 'string') === false) {
    console.log('ERROR. Impact argument MUST contain string type elements.');
    return 'ERROR';
  }

  const c1 = ia.indexOf('max') > -1;
  const c2 = ia.indexOf('min') > -1;

  if (!(c1 || c2)) {
    console.log('ERROR. Impact argument MUST contain string type element exactly named "max" or "min" accordingly.');
    return 'ERROR';
  }

  if (Array.isArray(w) === false) {
    console.log('ERROR. Weights argument MUST be an array.');
    return 'ERROR';
  }

  if (w.length !== m.cols) {
    console.log('ERROR. Weights argument size MUST be equal to Alternative Matrix columns size.');
    return 'ERROR';
  }

  let i = 0;

  for (i = 0; i < m.cols; i += 1) {
    if (w[i] > 1) {
      console.log('ERROR. The value from an element in the weights argument cannot be higher than 1.');
      return 'ERROR';
    }
  }

  function add(a, b) {
    return a + b;
  }


  if (w.reduce(add, 0) > 1) {
    console.log('ERROR. Elements from the weights argument must sum exactly 1.');
    return 'ERROR';
  }


  // Calculating norm
  let j; // Cols
  i = 0; // Rows
  let norm = 0;
  const normArray = [];

  for (j = 0; j < m.cols; j += 1) {
    for (i = 0; i < m.rows; i += 1) {
      const num = m.data[i][j];
      norm = (num ** 2) + norm;
    }

    norm = Math.round(Math.sqrt(norm) * 100) / 100;
    normArray.push(norm);
    norm = 0;
  }

  let mNormArray = [];

  i = 0;

  for (i = 0; i < m.rows; i += 1) {
    mNormArray.push(normArray);
  }

  mNormArray = new Matrix(mNormArray);

  // Normalised Alternative Matrix

  let nm = [];

  nm = m.div(mNormArray);

  // Weighted normalised alternative matrix
  let ev = [];
  i = 0;
  for (i = 0; i < m.rows; i += 1) {
    ev.push(w);
  }

  ev = new Matrix(ev);

  const wnm = nm.mul(ev);


  // Computing ideal and anti-ideal solution

  i = 0; // Rows
  j = 0; // Columns
  let a = 0; // iterations
  let attributeValues = [];
  const idealSolution = [];
  const aidealSolution = [];
  let attributeFunction = null;

  for (a = 0; a < 2; a += 1) {
    for (j = 0; j < m.cols; j += 1) {
      for (i = 0; i < m.rows; i += 1) {
        attributeValues.push(wnm.data[i][j]);
      }

      if (a === 0) {
        if (ia[j] === 'min') {
          attributeFunction = Math.min(...attributeValues);
          idealSolution.push(attributeFunction);
        } else if (ia[j] === 'max') {
          attributeFunction = Math.max(...attributeValues);
          idealSolution.push(attributeFunction);
        }
      } else if (a === 1) {
        if (ia[j] === 'min') {
          attributeFunction = Math.max(...attributeValues);
          aidealSolution.push(attributeFunction);
        } else if (ia[j] === 'max') {
          attributeFunction = Math.min(...attributeValues);
          aidealSolution.push(attributeFunction);
        }
      }

      attributeValues = [];
    }
    j = 0;
  }


  // Calculate distance to ideal and antiideal solution
  i = 0; // Rows
  j = 0; // Cols
  a = 0;

  const listIdeal = [];
  const listaIdeal = [];
  let distToI = 0;
  let distToaI = 0;

  for (a = 0; a < 2; a += 1) {
    for (i = 0; i < m.rows; i += 1) {
      distToI = 0;
      distToaI = 0;
      for (j = 0; j < m.cols; j += 1) {
        if (a === 0) {
          distToI += ((wnm.data[i][j] - idealSolution[j]) ** 2);
        } else {
          distToaI += ((wnm.data[i][j] - aidealSolution[j]) ** 2);
        }
      }

      if (a === 0) {
        distToI = Math.sqrt(distToI);
        listIdeal.push(distToI);
      } else {
        distToaI = Math.sqrt(distToaI);
        listaIdeal.push(distToaI);
      }
    }
  }


  i = 0;
  const listedPerformancedScore = [];
  let performanceScore = null;
  for (i = 0; i < m.rows; i += 1) {
    performanceScore = listaIdeal[i] / (listIdeal[i] + listaIdeal[i]);
    listedPerformancedScore.push(performanceScore);
  }


  const indexedPerformanceScore = [];
  i = 0;
  for (i = 0; i < m.rows; i += 1) {
    const dp = {
      index: i,
      data: m.data[i],
      ps: listedPerformancedScore[i],
    };
    indexedPerformanceScore.push(dp);
  }


  const rankedPerformanceScore = indexedPerformanceScore.sort(sortedBy('ps'));

  return rankedPerformanceScore[0].data;
}; // TERMINA FUNCION


exports.createRandom = function createRandom() {
  const cn = Math.floor(Math.random() * 6) + 2;
  const rn = Math.floor(Math.random() * 20) + 1;
  let i = 0;
  let j = 0;

  let c = [];

  const r = [];

  for (i = 0; i < rn; i += 1) {
    for (j = 0; j < cn; j += 1) {
      c.push(Math.floor(Math.random() * 1000) + 1);
    }
    r.push(c);
    c = [];
  }

  const m2 = new Matrix(r);

  const w2 = [];
  const ia2 = [];
  j = 0;

  let num = 0;

  for (j = 0; j < cn; j += 1) {
    num = Math.random();
    w2.push(num);
  }

  j = 0;
  num = 0;

  for (j = 0; j < cn; j += 1) {
    num = w2[j] + num;
  }

  let sum = 0;


  while (!((sum > 0.95) && (sum < 1.05))) {
    sum = Math.round(num);
    num -= 1;
    num /= cn;

    j = 0;

    for (j = 0; j < cn; j += 1) {
      w2[j] = Number((w2[j] - num).toFixed(2));
    }


    for (j = 0; j < cn; j += 1) {
      w2[j] = Math.abs(w2[j]);
    }

    num = 0;
    j = 0;
    for (j = 0; j < cn; j += 1) {
      num = w2[j] + num;
    }


    sum = num;
  }


  num = 0;
  j = 0;
  let v = '';


  for (j = 0; j < cn; j += 1) {
    num = Math.floor(Math.random() * 2);
    if (num === 1) {
      v = 'max';
    } else if (num === 0) {
      v = 'min';
    }
    ia2.push(v);
  }

  const resp = { m: m2, w: w2, ia: ia2 };


  return resp;
};

},{"linear-algebra":4}]},{},[1]);
