// @flow strict
import React, { useState } from "react";
import styles from "./EmailSignUpForm.module.scss";
import addToMailchimp from "gatsby-plugin-mailchimp";

const EmailSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const response = await addToMailchimp(email);
    setLoading(false);

    if (response.result === "error") {
      setError(response.msg);
    } else {
      setSuccess(response.msg);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={styles["email-signup-form"]}>
      <p className={styles["email-signup-form__title"]}>
        Want more content like this? Sign up below
      </p>
      <input
        type="email"
        placeholder="Your email address"
        onChange={e => setEmail(e.target.value)}
        className={styles["email-signup-form__email-input"]}
      />

      <button
        type="submit"
        disabled={loading}
        className={styles["email-signup-form__subscribe-button"]}
      >
        Subscribe
      </button>
      {error && (
        <p
          className={styles["email-signup-form__error-message"]}
          dangerouslySetInnerHTML={{ __html: error }}
        ></p>
      )}

      {success && (
        <p
          className={styles["email-signup-form__success-message"]}
          dangerouslySetInnerHTML={{ __html: success }}
        ></p>
      )}
    </form>
  );
};

export default EmailSignUpForm;
