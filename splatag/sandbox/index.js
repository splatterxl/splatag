module.exports.run = function(res) {
  const ast = res.ast;
  const buff = [];
  const varData = new Map();

  const err = [];

  for (const component of ast) {
    switch(component.type) {
      case "text":
        buff.push(component.value);
        break;
      case "ref": {    
        const props = component.value.split(".");
        
        if (/prototype|constructor/g.test(component.value)) {
          err.push(`Attempt to escape from sandbox: ${component.value}`);
        }

        const ref = props.shift();

        let val;

        if (ref === "this") val = res;
        else if (ref.startsWith("$")) val = res.context[ref.slice(1)];
        else if (/^[0-9]+n?$/.test(ref)) val = parseInt(ref);
        else {
          val = varData.get(ref);
        }

        if (val === undefined) {
          err.push(`Reference to undefined variable: ${component.value}`);
          break;
        }

        let parent;

        for (const prop of props) {
          parent = val; 

          switch (prop) {
            default:
              val = applyUtilityFunctions(val[prop]);

              if (val === undefined) {
                err.push(`Reference to undefined property: ${component.value}`);
                
              } else if (typeof val === "function") {
                val = val.call(parent);
              }

              break;
          }
        }

        buff.push(typeof val === "string" ? val : `\`\`\`js\n${require("util").inspect(val, { depth: 0, colors: false, compact: true })}\n\`\`\``);

        break;
      }
    }
  }

  return err.length ? `\`\`\`js\n${err.join("\n")}\n\`\`\`` : buff.join("").trim();
}

function applyUtilityFunctions(value) {
  switch (typeof value) {
    case "string":
      value.upper = value.toUpperCase.bind(value);
      value.lower = value.toLowerCase.bind(value);
      value = applyArrayUtilities(value);
      break;
    case "object":
      if (Array.isArray(value)) applyArrayUtilities(value);
      else if (value instanceof Date) {
        value.iso_8601 = value.toISOString.bind(value);
        value.iso = value.toISOString.bind(value);
        value.unix = value.getTime.bind(value);
        value.utc = value.toUTCString.bind(value);
      }
      break;
  }

  return value;
}

/** 
 * @param {Array} arr
 */
function applyArrayUtilities(arr) {
  arr.len = arr.length;
  arr.last = arr[arr.length - 1];

  return arr;
}
