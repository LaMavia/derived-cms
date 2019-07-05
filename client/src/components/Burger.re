[@react.component]
let make = (~state) => {
  let (collapsed, collapse) = state;

  <button className="nav__burger" onClick={_e => collapse(!collapsed)}>
     <Icon name=`burger /> </button>;
    // <div className="nav__burger__icon" dangerouslySetInnerHTML={"__html": logo} />
};