open Helpers;
open ReactDOMRe;
let styles =
  Style.make(
    ~width="100vw",
    ~height="100vh", 
    ());

[@react.component]
let make = (~path) => {
  let route =
    Location.origin
    ++ "/"
    ++ (path |> Belt.List.toArray |> Js.Array.joinWith("/"));
  <div style=styles>
    "404"->str
    <br />
    {route |> str}
    <br />
    "Not found"->str
  </div>;
};