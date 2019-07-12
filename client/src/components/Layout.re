open Helpers;

module NavInstance = {
  [@react.component]
  let make = (~state) => {
    let (cols, setcols) = useState([||]);

    React.useEffect0(() => {
      ignore(
        Js.Promise.(
          Fetch.fetch("/db_api/labels")
          |> then_(Fetch.Response.json)
          |> then_(x => x->JMySon.Decode.labels_response->resolve)
          |> then_((x: JMySon.labels_response) => x.data->setcols->resolve)
        ),
      );
      None;
    });

    <Nav state>
      <Nav.Item key="0" href="/" icon={<Icon name=`id />}>
        "Welcome"->str
      </Nav.Item>
      <Nav.Submenu
        key="1"
        nItems=1
        href="#"
        icon={<Icon name=`burger />}
        rootContent={"Hello"->str}>
        <Nav.Item href="#" key="0" icon={<Icon name=`id />}>
          "there"->str
        </Nav.Item>
      </Nav.Submenu>
      {cols
       ->Belt.Array.mapWithIndex((i, collection) =>
           <Nav.Submenu
             href="#"
             key={(i + 1)->string_of_int}
             nItems=1
             icon={<Icon name=`folder />}
             rootContent={collection->str}>
             <Nav.Item
               href={j|/collection/$(collection)/overview|j}
               icon={<Icon name=`id />}>
               "overview"->str
             </Nav.Item>
           </Nav.Submenu>
         )
       ->React.array}
    </Nav>;
  };
};

[@react.component]
let make = (~children, ~renderNav) => {
  let (collapsed, collapse) = useState(false);

  <section
    className={
      [|"layout", if (collapsed) {"collapsed"} else {""}|]
      |> Js.Array.joinWith(" ")
    }>
    {if (renderNav) {
       <NavInstance state=(collapsed, collapse) />;
     } else {
       <> </>;
     }}
    <section className="content"> children </section>
  </section>;
};