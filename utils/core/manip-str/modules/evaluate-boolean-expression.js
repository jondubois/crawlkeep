export function evaluateBooleanExpression(expression) {
  // Extend tokenization to include the NOT operator
  const tokens = expression.match(/\(|\)|\w+|AND|OR|NOT/g);

  // Function to apply the NOT operation
  const applyNot = (value) => !value;

  // Function to evaluate the expression based on token precedence
  function evaluate(tokens) {
    const valuesStack = [];
    const opsStack = [];

    // Define precedence for operators
    const precedence = {
      NOT: 3,
      AND: 2,
      OR: 1,
    };

    // Function to perform operation
    const performOperation = () => {
      const operator = opsStack.pop();
      if (operator === "NOT") {
        const value = valuesStack.pop();
        valuesStack.push(applyNot(value));
      } else {
        const right = valuesStack.pop();
        const left = valuesStack.pop();
        switch (operator) {
          case "AND":
            valuesStack.push(left && right);
            break;
          case "OR":
            valuesStack.push(left || right);
            break;
        }
      }
    };

    // Function to handle precedence and perform operations
    const handlePrecedence = (currentOp) => {
      while (
        opsStack.length > 0 &&
        precedence[currentOp] <= precedence[opsStack[opsStack.length - 1]]
      ) {
        performOperation();
      }
    };

    tokens.forEach((token) => {
      if (token === "true" || token === "false") {
        valuesStack.push(token === "true");
      } else if (token === "NOT") {
        opsStack.push(token);
      } else if (token === "AND" || token === "OR") {
        handlePrecedence(token);
        opsStack.push(token);
      } else if (token === "(") {
        opsStack.push(token);
      } else if (token === ")") {
        while (opsStack[opsStack.length - 1] !== "(") {
          performOperation();
        }
        opsStack.pop(); // Remove the '(' from stack
      }
    });

    // Perform remaining operations
    while (opsStack.length > 0) {
      performOperation();
    }

    return valuesStack.pop();
  }

  return evaluate(tokens);
}

// // Example usage
// const expression0 =
//   "false AND true AND (true OR false) OR false AND (true) OR (false AND (false OR true)) AND (true OR false)";
// const expression1 = "true AND (false) OR false";
// const result = evaluateBooleanExpression(expression0);
// console.log(result); // Should output false
// debugger;

// export function evaluateBooleanExpression(expression) {
//   // Split the expression into tokens for easier processing
//   const tokens = expression.match(/\(|\)|\w+|AND|OR/g);

//   function evaluate(tokens) {
//     const stack = [];
//     let currentOperation = null;

//     while (tokens.length > 0) {
//       const token = tokens.shift();
//       if (token === "(") {
//         stack.push(evaluate(tokens));
//       } else if (token === ")") {
//         break;
//       } else if (token === "AND" || token === "OR") {
//         currentOperation = token;
//       } else {
//         const value = token === "true";
//         if (currentOperation && stack.length > 0) {
//           if (currentOperation === "AND") {
//             const prevValue = stack.pop();
//             stack.push(prevValue && value);
//           } else if (currentOperation === "OR") {
//             // For OR, we need to check if there's an AND operation next
//             if (tokens[0] === "AND") {
//               // Evaluate the AND operation first
//               tokens.shift(); // Remove the AND operator
//               const nextValue = tokens.shift() === "true";
//               const andResult = value && nextValue;
//               // Now apply the OR operation with the result of the AND operation
//               const prevValue = stack.pop();
//               stack.push(prevValue || andResult);
//             } else {
//               const prevValue = stack.pop();
//               stack.push(prevValue || value);
//             }
//           }
//         } else {
//           stack.push(value);
//         }
//       }
//     }
//     return stack.length > 0
//       ? stack.reduce((acc, val) => acc || val, false)
//       : true;
//   }

//   return evaluate(tokens);
// }
