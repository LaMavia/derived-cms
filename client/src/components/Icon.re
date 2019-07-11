let burger = [%raw {|require("@public/svg/burger.svg")|}];
let id = [%raw {|require("@public/svg/id-card.svg")|}];
let folder = [%raw {|require("@public/svg/folder.svg")|}];

type name = [ | `burger | `id | `folder];

[@react.component]
let make = (~name) => {
  let logo =
    switch (name) {
    | `burger => burger
    | `id => id
    | `folder => folder
    };
  <div dangerouslySetInnerHTML={"__html": logo} />;
};