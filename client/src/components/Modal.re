open Helpers;

module Empty = {
  [@react.component]
  let make = (~children, ~className="", ~onAccept) => {
    <form
      className="modal"
      onSubmit={e => {
        e->ReactEvent.Form.preventDefault;
        e->onAccept;
      }}>
      <field className={"modal__body " ++ className}> children </field>
      <nav className="modal__nav">
        <button className="modal__nav__btn"> "cancel"->str </button>
        <button type_="submit" className="modal__nav__btn">
          "accept"->str
        </button>
      </nav>
    </form>;
  };
};
/**
  Can't make an "NFields" component, because Reason doesn't support dynamic record keys.
 */
module TwoFields = {
  [@react.component]
  let make = (~labels, ~onAccept) => {
    let (l1, l2) = labels;
    <Empty
      onAccept={e =>
        [|
          e->ReactEvent.Form.currentTarget##l1,
          e->ReactEvent.Form.currentTarget##l2,
        |]
        ->onAccept
      }>
      <label htmlFor=l1 className="modal__body__label"> l1->str </label>
      <input name=l1 type_="text" className="model__body__input" />
      <label htmlFor=l2 className="modal__body__label"> l2->str </label>
      <input name=l2 type_="text" className="model__body__input" />
    </Empty>;
  };
};