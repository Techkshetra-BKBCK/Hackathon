import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
	WELCOME_EMAIL_TEMPLATE,
	ACCOUNT_CREATED_TEMPLATE
  } from "./emailTemplates.js";
  import { transporter, mailOptions } from "./smtp.config.js";
  
  export const sendVerificationEmail = async (email, verificationToken) => {
	try {
	  await transporter.sendMail({
		...mailOptions,
		to: email,
		subject: "Verify your email",
		html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
	  });
	  console.log("Verification email sent successfully");
	} catch (error) {
	  console.error("Error sending verification email:", error);
	  throw new Error(`Error sending verification email: ${error.message}`);
	}
  };
  
  export const sendWelcomeEmail = async (email, name) => {
	try {
	  await transporter.sendMail({
		...mailOptions,
		to: email,
		subject: "Welcome to Our Platform!",
		html: WELCOME_EMAIL_TEMPLATE
		  .replace(/{name}/g, name)
		  .replace(/{company_name}/g, "Auth Company")
		  .replace(/{clientURL}/g, process.env.CLIENT_URL)
	  });
	  console.log("Welcome email sent successfully");
	} catch (error) {
	  console.error("Error sending welcome email:", error);
	  throw new Error(`Error sending welcome email: ${error.message}`);
	}
  };
  
  export const sendPasswordResetEmail = async (email, resetURL) => {
	try {
	  await transporter.sendMail({
		...mailOptions,
		to: email,
		subject: "Reset your password",
		html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
	  });
	  console.log("Password reset email sent successfully");
	} catch (error) {
	  console.error("Error sending password reset email:", error);
	  throw new Error(`Error sending password reset email: ${error.message}`);
	}
  };
  
  export const sendResetSuccessEmail = async (email) => {
	try {
	  await transporter.sendMail({
		...mailOptions,
		to: email,
		subject: "Password Reset Successful",
		html: PASSWORD_RESET_SUCCESS_TEMPLATE
	  });
	  console.log("Password reset success email sent");
	} catch (error) {
	  console.error("Error sending reset success email:", error);
	  throw new Error(`Error sending reset success email: ${error.message}`);
	}
  };
  
  export const sendAccountCreatedEmail = async (email, name) => {
	try {
	  await transporter.sendMail({
		...mailOptions,
		to: email,
		subject: "Account Created Successfully",
		html: ACCOUNT_CREATED_TEMPLATE
		  .replace(/{name}/g, name)
		  .replace(/{company_name}/g, "Auth Company")
	  });
	  console.log("Account creation email sent");
	} catch (error) {
	  console.error("Error sending account creation email:", error);
	  throw new Error(`Error sending account creation email: ${error.message}`);
	}
  };