open Helpers;

[@react.component]
let make = (~title, ~children, ~onSubmit, ~btnValue, ~textUnder) => {
  let ((x, y), setpos) = useState((0, 0));
  let style =
    ReactDOMRe.Style.(
      make()
      ->unsafeAddProp("--x", x->string_of_int)
      ->unsafeAddProp("--y", y->string_of_int)
    );

  <section
    className="auth"
    style
    onMouseMove={e =>
      (
        e->ReactEvent.Mouse.clientX / (-300),
        e->ReactEvent.Mouse.clientY / (-300),
      )
      |> setpos
    }>
    <img
      src="/static/images/auth_bg_6.jpg"
      alt="Photo by icon0.com from Pexels"
      className="auth__img"
    />
    <form
      action=""
      className="auth__form"
      onSubmit={e => {
        e->ReactEvent.Form.preventDefault;
        e->onSubmit;
      }}>
      <h1 className="auth__form__title"> title->str </h1>
      <fieldset className="auth__form__fields"> children </fieldset>
      <input
        type_="submit"
        value=btnValue
        className="auth__form__btn auth__form__btn--submit"
      />
      {textUnder()}
    </form>
  </section>;
};