[@react.component]
let make = (~children, ~href, ~className="") => {
  <a
    href
    onClick={e => {
      e->ReactEvent.Mouse.preventDefault;
      ReasonReactRouter.push(href);
    }}
    className>
    children
  </a>;
};