[@react.component]
let make = (~title, ~children, ~onSubmit, ~btnValue) => {
  <section className="auth">
    <img
      src="/images/auth_bg_4.jpg"
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
      <h1 className="auth__form__title"> title->Helpers.str </h1>
      <fieldset className="auth__form__fields"> children </fieldset>
      <input type_="submit" value=btnValue className="auth__form__btn auth__form__btn--submit"/>
    </form>
  </section>;
};