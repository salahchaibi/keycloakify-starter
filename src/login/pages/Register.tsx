import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import "./Register.css";

type KcContext_Register = Extract<KcContext, { pageId: "register.ftl" }>;

type ProfileAttribute = {
    name?: string;
    displayName?: string;
    value?: string | string[];
    required?: boolean;
    readOnly?: boolean;
    validators?: {
        options?: {
            options?: string[];
        };
    };
    annotations?: {
        inputType?: string;
        inputHelperTextBefore?: string;
        inputHelperTextAfter?: string;
        inputOptionLabels?: Record<string, string>;
        inputOptionLabelsI18nPrefix?: string;
    };
};

export default function Register(props: { kcContext: KcContext_Register; i18n: I18n }) {
    const { kcContext } = props;
    void props.i18n;

    const {
        url,
        realm,
        message,
        messagesPerField,
        profile,
        recaptchaRequired,
        recaptchaSiteKey,
        scripts,
        termsAcceptanceRequired
    } = kcContext;

    const xkc = (kcContext as KcContext_Register & {
        "x-keycloakify"?: { messages?: Record<string, string> };
    })["x-keycloakify"];

    const resolveMessage = (value?: string) => {
        if (!value) return undefined;
        const match = value.match(/^\$\{(.+)\}$/);
        if (!match) return value;
        const key = match[1];
        return xkc?.messages?.[key];
    };

    const humanize = (value: string) =>
        value
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, m => m.toUpperCase());

    const toLabel = (raw?: string, fallbackKey?: string) => {
        if (!raw && !fallbackKey) return "";
        const resolved = resolveMessage(raw);
        if (resolved) return resolved;
        const key = raw?.match(/^\$\{(.+)\}$/)?.[1] ?? fallbackKey ?? raw ?? "";
        const last = key.split(".").pop() ?? key;
        return humanize(last);
    };

    const attributesByName = (profile?.attributesByName ??
        {}) as Record<string, ProfileAttribute | undefined>;

    const renderFieldError = (fieldName: string) =>
        messagesPerField?.existsError?.(fieldName) ? (
            <div className="kc-register-error">
                {messagesPerField.get?.(fieldName)}
            </div>
        ) : null;

    const renderAttributeField = (key: string, attr?: ProfileAttribute) => {
        if (!attr) return null;

        const name = attr.name ?? key;
        const label = toLabel(attr.displayName, name);
        const helperBefore = resolveMessage(attr.annotations?.inputHelperTextBefore);
        const helperAfter = resolveMessage(attr.annotations?.inputHelperTextAfter);
        const isReadOnly = attr.readOnly ?? false;
        const isRequired = attr.required ?? false;

        const options = attr.validators?.options?.options ?? [];
        const isMulti =
            attr.annotations?.inputType === "multiselect-checkboxes";

        if (options.length > 0) {
            const optionLabels = attr.annotations?.inputOptionLabels ?? {};
            const optionPrefix = attr.annotations?.inputOptionLabelsI18nPrefix;

            if (isMulti) {
                const values = Array.isArray(attr.value) ? attr.value : [];
                return (
                    <div className="kc-register-field" key={name}>
                        <span className="kc-register-label">
                            {label}
                            {isRequired ? " *" : ""}
                        </span>
                        {helperBefore && (
                            <div className="kc-register-helper">{helperBefore}</div>
                        )}
                        <div className="kc-register-checkboxes">
                            {options.map(option => {
                                const labelKey = optionPrefix
                                    ? `${optionPrefix}.${option}`
                                    : undefined;
                                const optionLabel =
                                    optionLabels[option] ??
                                    (labelKey ? xkc?.messages?.[labelKey] : undefined) ??
                                    humanize(option);
                                return (
                                    <label
                                        key={option}
                                        className="kc-register-checkbox"
                                    >
                                        <input
                                            type="checkbox"
                                            name={name}
                                            value={option}
                                            defaultChecked={values.includes(option)}
                                            disabled={isReadOnly}
                                        />
                                        <span>{optionLabel}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {renderFieldError(name)}
                        {helperAfter && (
                            <div className="kc-register-helper">{helperAfter}</div>
                        )}
                    </div>
                );
            }

            return (
                <label className="kc-register-field" key={name}>
                    <span className="kc-register-label">
                        {label}
                        {isRequired ? " *" : ""}
                    </span>
                    {helperBefore && (
                        <span className="kc-register-helper">{helperBefore}</span>
                    )}
                    <select
                        className="kc-register-input"
                        name={name}
                        defaultValue={
                            Array.isArray(attr.value) ? attr.value[0] : attr.value
                        }
                        disabled={isReadOnly}
                    >
                        <option value="">Select…</option>
                        {options.map(option => {
                            const labelKey = optionPrefix
                                ? `${optionPrefix}.${option}`
                                : undefined;
                            const optionLabel =
                                optionLabels[option] ??
                                (labelKey ? xkc?.messages?.[labelKey] : undefined) ??
                                humanize(option);
                            return (
                                <option key={option} value={option}>
                                    {optionLabel}
                                </option>
                            );
                        })}
                    </select>
                    {renderFieldError(name)}
                    {helperAfter && (
                        <span className="kc-register-helper">{helperAfter}</span>
                    )}
                </label>
            );
        }

        const type = name.toLowerCase().includes("email") ? "email" : "text";

        return (
            <label className="kc-register-field" key={name}>
                <span className="kc-register-label">
                    {label}
                    {isRequired ? " *" : ""}
                </span>
                {helperBefore && (
                    <span className="kc-register-helper">{helperBefore}</span>
                )}
                <input
                    className="kc-register-input"
                    type={type}
                    name={name}
                    defaultValue={Array.isArray(attr.value) ? attr.value[0] : attr.value ?? ""}
                    disabled={isReadOnly}
                />
                {renderFieldError(name)}
                {helperAfter && (
                    <span className="kc-register-helper">{helperAfter}</span>
                )}
            </label>
        );
    };

    return (
        <div className="kc-register-page">
            {scripts?.map(src => (
                <script key={src} src={src} />
            ))}
            <div className="kc-register-card">
                <header className="kc-register-header">
                    <h1 className="kc-register-title">Create your account</h1>
                    {message && (
                        <p className={`kc-register-message kc-register-message--${message.type}`}>
                            {message.summary}
                        </p>
                    )}
                </header>

                <form className="kc-register-form" action={url.registrationAction} method="post">
                    {Object.entries(attributesByName).map(([key, attr]) =>
                        renderAttributeField(key, attr)
                    )}

                    {realm?.registrationEmailAsUsername && !attributesByName.username && (
                        <div className="kc-register-helper">
                            Your email will be used as your username.
                        </div>
                    )}

                    <label className="kc-register-field">
                        <span className="kc-register-label">Password</span>
                        <input
                            className="kc-register-input"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                        />
                        {renderFieldError("password")}
                    </label>

                    <label className="kc-register-field">
                        <span className="kc-register-label">Confirm password</span>
                        <input
                            className="kc-register-input"
                            type="password"
                            name="password-confirm"
                            autoComplete="new-password"
                        />
                        {renderFieldError("password-confirm")}
                    </label>

                    {kcContext.passwordPolicies?.length && (
                        <div className="kc-register-helper">
                            Password must be at least {kcContext.passwordPolicies.length} characters.
                        </div>
                    )}

                    {termsAcceptanceRequired && (
                        <label className="kc-register-terms">
                            <input type="checkbox" name="termsAccepted" />
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: xkc?.messages?.termsText ?? "I agree to the terms"
                                }}
                            />
                        </label>
                    )}
                    {termsAcceptanceRequired && renderFieldError("termsAccepted")}

                    {recaptchaRequired && (
                        <div className="kc-register-recaptcha">
                            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
                        </div>
                    )}

                    <button className="kc-register-submit" type="submit">
                        Create account
                    </button>
                    <a className="kc-register-link" href={url.loginUrl}>
                        Already have an account? Sign in
                    </a>
                </form>
            </div>
        </div>
    );
}
