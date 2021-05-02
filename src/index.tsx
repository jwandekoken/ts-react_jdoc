import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [esbuildInitialized, setEsbuildInitialized] = useState(false);

  useEffect(() => {
    esbuild
      .initialize({
        wasmURL: "/esbuild.wasm",
      })
      .then(() => {
        setEsbuildInitialized(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const onClick = () => {
    if (!esbuildInitialized) {
      return;
    }

    esbuild
      .build({
        entryPoints: ["index.js"],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        // This feature provides a way to replace global identifiers with constant expressions
        define: {
          // see below that if we pass only 'production', it will replace the var 'process.env.NODE_ENV' with a var 'production', so, we have to wrap it in quotes, inside the first pair of quotes, so ESBuild will replace it by the string 'production', not a production var
          "process.env.NODE_ENV": '"production"',
          // see below that we wanna replace the global var to the window var, so we only have to use one pair of quotes
          global: "window",
        },
      })
      .then((result) => {
        console.log(result);
        setCode(result.outputFiles[0].text);
      });
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
