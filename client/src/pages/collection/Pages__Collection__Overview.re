/**
 "collection/:model" => overview
 { |layout: grid {2 cols, x rows}|
   1. number of entries -> "collection/:model/entries"
   2. storage size (mb / kb depending on the size <kb><-|1mb|-><mb><-|1gb|-><gb>)
   3. display  the schema [click -> edit schema]
   4. refresh button -> re-fetch the data
   @done [
     - api endpoint
   ]
   @todo [
     - display
   ]
 } ? data: [schema, collection-stats[size, count, ...]]
 "collection/:model/entries" => list of entries
 { // actions on enties ↓ //
   1. add
   2. edit
   3. delete

   // display
   1. limit to 10
   2. load more
   3. search i.e.: title:cats = search for an entry where `title` matchs `cats`
 }
 "collection/:model/entries/edit/:id" => entry editor:
 {
   display: { [key]: value } | actions: [delete, edit, edit_long, add_field]
 }
 */
open Helpers;

module Box = {
  [@react.component]
  let make = (~title, ~children, ~className="") => {
    <article className={"content__collection__box " ++ className}>
      <header className="content__collection__box__header">
        <h1 className="content__collection__box__header__title">
          title->str
        </h1>
      </header>
      <section className="content__collection__box__body"> children </section>
    </article>;
  };
};

let displaySchema: array((string, string)) => React.element =
  schema =>
    schema
    ->Belt.Array.mapWithIndex((i, entry) => {
        let (key, prop) = entry;
        <tr
          className="content__collection__box__body__table__row"
          key={i->string_of_int}>
          <td className="content__collection__box__body__table__row__cell">
            key->str
          </td>
          <td className="content__collection__box__body__table__row__cell">
            prop->str
          </td>
        </tr>;
      })
    ->React.array;

let format_size = (size: (float, string)) => {
  let (a, b) = size;
  let a = a->Js.Float.toString;
  a ++ b;
};

[@react.component]
let make = (~modelName) => {
  open JMySon;
  let (state: option(overview_state), setState) = useState(None);

  React.useEffect0(() => {
    ignore(
      Js.Promise.(
        Fetch.fetch({j|/db_api/collection/$(modelName)/overview|j})
        |> then_(Fetch.Response.json)
        |> then_(x => x->Decode.overview_response->resolve)
        |> then_(x => x.data |> resolve)
        |> then_(x => x->Some |> setState |> resolve)
      ),
    );
    None;
  });

  <div className="content__collection content__collection--overview">
    {switch (state) {
     | Some(state) =>
       <>
         <Box title="stats" className="content__collection__box--hor">
           <span className="content__collection__box__body__text">
             {("count: " ++ state.stats.count->string_of_int)->str}
           </span>
           <span className="content__collection__box__body__text">
             {("size: " ++ state.stats.size->format_size)->str}
           </span>
         </Box>
         <Box title="schema">
           <table className="content__collection__box__body__table">
             <tbody>
               <tr className="content__collection__box__body__table__head">
                 <th
                   className="content__collection__box__body__table__head__cell">
                   "name"->str
                 </th>
                 <th
                   className="content__collection__box__body__table__head__cell">
                   "type"->str
                 </th>
               </tr>
               state.schema->displaySchema
             </tbody>
           </table>
         </Box>
       </>
     | None => <span> "loading..."->str </span>
     }}
  </div>;
};