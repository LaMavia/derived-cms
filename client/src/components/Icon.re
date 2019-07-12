let burger = [%raw {|require("@public/svg/burger.svg")|}];
let id = [%raw {|require("@public/svg/id-card.svg")|}];
let folder = [%raw {|require("@public/svg/folder.svg")|}];
let resume = [%raw {|require("@public/svg/resume.svg")|}];

type name = [ | `burger | `id | `folder];

[@react.component]
let make = (~name) => {
  let logo =
    switch (name) {
    | `burger => burger
    | `id => id
    | `folder => folder
    | `resume => resume
    };
  <div dangerouslySetInnerHTML={"__html": logo} />;
};