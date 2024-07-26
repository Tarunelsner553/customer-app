import {
  reactExtension,
  BlockStack,
  Checkbox,
  Text,
  Grid,
  Button,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";
import { PhoneField } from "@shopify/ui-extensions/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const applyAttributeChange = useApplyAttributeChange();

  const onCheckboxChange = (setState) => async (isChecked) => {
    setState(isChecked);
    try {
      const result = await applyAttributeChange({
        key: "requestedFreeGift",
        type: "updateAttribute",
        value: isChecked ? "yes" : "no",
      });
      console.log("applyAttributeChange result", result);
    } catch (error) {
      console.error("Error applying attribute change", error);
    }
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    console.log("Phone Number Changed:", value);
  };

  const handlePhoneErrorChange = (value) => {
    if (value) {
      setPhoneNumberError("");
    } else {
      setPhoneNumberError("Phone number is required");
    }
  }
  const handleRegisterClick = () => {
    if (!phoneNumber) {
      setPhoneNumberError("Phone number is required");
      return;
    }
    // if (!/^\d{10}$/.test(phoneNumber)) {
    //   console.error("Invalid phone number");
    //   return;
    // }
    const formdata = new FormData();
    formdata.append("EmailConsent", emailConsent);
    formdata.append("SmsConsent", smsConsent);
    formdata.append("PhoneNumber", phoneNumber);
    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };

    fetch("https://operate-burden-nintendo-info.trycloudflare.com/api/checkoutdata", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Text>Banner</Text>
      <Grid columns={['56%', '22%', '22%']} rows={[40, 'auto']}>
        <Text size="base">Win your full order amount back. Register to win</Text>
        <Checkbox onChange={onCheckboxChange(setEmailConsent)}>
          Email Consent
        </Checkbox>
        <Checkbox onChange={onCheckboxChange(setSmsConsent)}>
          SMS Consent
        </Checkbox>
      </Grid>
      <PhoneField label="Phone Number" onChange={handlePhoneChange} onInput={handlePhoneErrorChange}></PhoneField>
      <Text appearance="critical">{phoneNumberError}</Text>
      <Text>
        By signing up via text, you agree to receive recurring automated
        marketing messages, Reply STOP to unsubscribe.View our Privacy Policy
        and Terms of Service.
      </Text>
      <Button onPress={handleRegisterClick}>Register</Button>
    </BlockStack>
  );
}
