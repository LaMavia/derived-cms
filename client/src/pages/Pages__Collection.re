open Helpers;

/**
 "collection/:model" => overview 
 { |layout: grid {2 cols, x rows}|
   1. number of entries -> "collection/:model/entries"
   2. storage size (mb / kb depending on the size <kb><-|1mb|-><mb><-|1gb|-><gb>)
   3. display  the schema [click -> edit schema]
   4. refresh button -> re-fetch the data
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

[@react.component]
let make = (~modelName) => {
  let (items, setItems) = useState([||]);

  React.useEffect0(() => None);

  <div className="content__posts" />;
};