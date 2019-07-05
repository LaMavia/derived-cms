open Helpers;

[@react.component]
let make = (~children) => {
  let (collapsed, collapse) = useState(false);

  <section
    className={
      [|
        "layout",
        if (collapsed) {
          "collapsed";
        } else {
          "";
        },
      |]
      |> Js.Array.joinWith(" ")
    }>
    <Nav state=(collapsed, collapse)>
      <Nav.Item href="#" icon={<Icon name=`id />}> "Hello"->str </Nav.Item>
      <Nav.Submenu
        nItems=1 href="#" icon={<Icon name=`burger />} rootContent={"Hello"->str}>
        <Nav.Item href="#" icon={<Icon name=`id />}> "there"->str </Nav.Item>
      </Nav.Submenu>
      <Nav.Submenu
        nItems=3 href="#" icon={<Icon name=`burger />} rootContent={"Hello"->str}>
        <Nav.Item href="#" icon={<Icon name=`id />}> "there"->str </Nav.Item>
        <Nav.Item href="#" icon={<Icon name=`id />}> "good"->str </Nav.Item>
        <Nav.Item href="#" icon={<Icon name=`id />}> "sir"->str </Nav.Item>
      </Nav.Submenu>
    </Nav>
    <section className="content"> children </section>
  </section>;
};