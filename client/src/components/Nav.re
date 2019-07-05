/**
 nav
 => burger // <button/>
 ==> icon
 => item [expanded] |for submenu| {bg-color: inherit}
 ==> link
 ===> icon
 ===> text
 ==> submenu // <ul/>
 ===> @nav__item
 */
open Helpers;

module Item = {
  /*** height of <a/> = --nav-item-h  */
  [@react.component]
  let make = (~href, ~icon, ~children, ~onClick=?, ~className=?) => {
    <li
      className={
        [|
          "nav__list__item",
          switch (className) {
          | Some(c) => c
          | None => ""
          },
        |]
        |> Js.Array.joinWith(" ")
      }
      onClick={e =>
        switch (onClick) {
        | Some(onClick) => e->onClick
        | None => ()
        }
      }>
      <a href className="nav__list__item__link">
        <figure className="nav__list__item__link__icon"> icon </figure>
        <span className="nav__list__item__link__text"> children </span>
      </a>
    </li>;
  };
};

module Submenu = {
  [@react.component]
  let make = (~children, ~href, ~icon, ~rootContent, ~nItems) => {
    let (isopen, setopen) = useState(false);
    let style =
      ReactDOMRe.Style.make()
      ->ReactDOMRe.Style.unsafeAddProp("--n", nItems->string_of_int);

    <li
      className={
        [|"nav__submenu", if (isopen) {"nav__submenu--open"} else {""}|]
        |> Js.Array.joinWith(" ")
      }
      style>
      <Item
        href
        icon
        onClick={_ => setopen(!isopen)}
        className="nav__submenu__root">
        rootContent
      </Item>
      <ul className="nav__submenu__list"> children </ul>
    </li>;
  };
};

[@react.component]
let make = (~state, ~children) => {
  let (collapsed, collapse) = state;

  <nav
    className={
      [|"nav", if (collapsed) {"nav--collapsed"} else {""}|]
      |> Js.Array.joinWith(" ")
    }>
    <Burger state=(collapsed, collapse) />
    <ul className="nav__list"> children </ul>
  </nav>;
};