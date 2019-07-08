[@react.component]
let make = (~name, ~type_, ~placeholder, ~label) => 
  <label htmlFor="" className="auth__form__label">
    label -> Helpers.str
    <input type_ placeholder name id=name className="auth__form__label__input"/>
  </label>