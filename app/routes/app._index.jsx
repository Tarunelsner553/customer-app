import React from "react";
import {
  AppProvider,
  Page,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  Select,
  RangeSlider,
  Text,
  Badge,
  Icon
} from "@shopify/polaris";
import "../assets/app.css";
import Checkbox from "../routes/checkbox";
import Checkbox2 from "../routes/checkbox2";
import * as PolarisIcons from '@shopify/polaris-icons';
import { Avatar } from "@shopify/polaris";
import { DataFetcher } from '../components/DataFetcher';

//SHOPIFY_API_KEY=e3d2e91e46acb3057a957df2cb12aace

function App() {
  const [customers, setCustomers] = React.useState([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [averageOrderValue, setAverageOrderValue] = React.useState(0);
  const [totalGiftCardValue, setTotalGiftCardValue] = React.useState(0);
  const [selectionMethod, setSelectionMethod] = React.useState("random");
  const [weightedScale, setWeightedScale] = React.useState(50);
  const [yes, setYes] = React.useState(false);
  const [selectedDateRange, setSelectedDateRange] = React.useState(null);

  const lastGiftCardOrderValue = selectedCustomer ? selectedCustomer.orderAmount : 0;

  const fetchCustomers = async (range) => {
    const { startDate, endDate } = getDateRange(range);
    const dateRange = JSON.stringify({ startDate, endDate });
    console.log("Request Made");
    setSelectedDateRange(range);

    try {
      const response = await fetch("/api/fetch-customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: dateRange
      });
      const data = await response.json();
      console.log("Response Done");
      setYes(true);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setCustomers(data);
      calculateAverageOrderValue(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const calculateAverageOrderValue = (customerData) => {
    // console.log("Customer Data in ordervalue: ", customerData);
    if (customerData.length > 0) {
      const totalOrderValue = customerData.reduce((sum, customer) => {
        const orderAmount = parseFloat(customer.orderAmount);
        // console.log(`Processing orderAmount: ${orderAmount} for customer: ${customer.id}`);
        return sum + (isNaN(orderAmount) ? 0 : orderAmount);
      }, 0);

      // console.log("Total Order Value: ", totalOrderValue);
      const averageOrderValue = (totalOrderValue / customerData.length).toFixed(2);
      // console.log("Average Order Value: ", averageOrderValue);
      setAverageOrderValue(averageOrderValue);
    } else {
      setAverageOrderValue(0);
    }
  };

  const fetchTotalGiftCardValue = async () => {
    const response = await fetch("/api/total-gift-card-value");
    const data = await response.json();
    // console.log("Total Gift Card Data: ", data);

    setTotalGiftCardValue(data.totalValue);
  };

  React.useEffect(() => {
    const lastUpdate = localStorage.getItem('lastEnvUpdate');
    const now = new Date().getTime();
    if (!lastUpdate || now - parseInt(lastUpdate) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('envUpdated');
      localStorage.setItem('lastEnvUpdate', now.toString());
    }
    fetchTotalGiftCardValue();
  }, []);

  React.useEffect(() => {
    updateEligibility();
  }, [weightedScale, selectionMethod, averageOrderValue]);

  const sortCustomers = (customers) => {
    return customers.sort((a, b) => {
      if (a.status === "Unnotified" && b.status !== "Unnotified") return -1;
      if (b.status === "Unnotified" && a.status !== "Unnotified") return 1;
      if (a.status === "Eligible" && b.status !== "Eligible") return -1;
      if (b.status === "Eligible" && a.status !== "Eligible") return 1;
      return 0;
    });
  };

  const updateEligibility = () => {
    if (selectionMethod === 'weighted') {
      const threshold = (weightedScale / 100) * averageOrderValue;
      setCustomers(prevCustomers => {
        const updatedCustomers = prevCustomers.map(customer => ({
          ...customer,
          status: ((customer.emailConsent === "Yes" || customer.smsConsent === "Yes") && customer.orderAmount > 0) &&
            parseFloat(customer.orderAmount) >= threshold ? "Eligible" : "Not Eligible",
          refundStatus: undefined // Reset refund status
        }));
        return sortCustomers(updatedCustomers);
      });
      setSelectedCustomer(null);
    } else {
      setCustomers(prevCustomers => {
        const updatedCustomers = prevCustomers.map(customer => ({
          ...customer,
          status: (customer.emailConsent === "Yes" || customer.smsConsent === "Yes") &&
            customer.orderAmount > 0 ? "Eligible" : "Not Eligible"
        }));
        return sortCustomers(updatedCustomers);
      });
    }
  };

  const selectCustomer = () => {
    const eligibleCustomers = customers.filter(customer => customer.status === "Eligible");

    if (eligibleCustomers.length > 0) {
      let selectedCustomer;
      if (selectionMethod === "random") {
        selectedCustomer = eligibleCustomers[Math.floor(Math.random() * eligibleCustomers.length)];
      } else {
        const totalWeight = eligibleCustomers.reduce(
          (sum, customer) => sum + Math.pow(parseFloat(customer.orderAmount), weightedScale / 50),
          0
        );
        let randomValue = Math.random() * totalWeight;

        for (let customer of eligibleCustomers) {
          randomValue -= Math.pow(parseFloat(customer.orderAmount), weightedScale / 50);
          if (randomValue <= 0) {
            selectedCustomer = customer;
            break;
          }
        }
      }

      if (selectedCustomer) {
        setSelectedCustomer(selectedCustomer);
        setCustomers(prevCustomers => {
          const updatedCustomers = prevCustomers.map(c => {
            if (c.id === selectedCustomer.id) {
              return { ...c, status: "Unnotified" };
            } else if (c.id === prevCustomers.find(pc => pc.status === "Unnotified")?.id) {
              // This is the previous winner, set it back to "Eligible"
              return { ...c, status: "Eligible" };
            } else {
              return c;
            }
          });

          // Sort the customers
          return sortCustomers(updatedCustomers);
        });
      }
    }
  };

  const notifyWinner = async () => {
    if (selectedCustomer) {
      try {
        const response = await fetch("/api/add-winner-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: selectedCustomer.id }),
        });
        const result = await response.json();
        if (result.success) {
          setCustomers(prevCustomers => {
            const updatedCustomers = prevCustomers.map(c =>
              c.id === selectedCustomer.id ? { ...c, status: "Notified" } : c
            );
            return sortCustomers(updatedCustomers);
          });
          alert("Winner tag added successfully!");
        } else {
          throw new Error("Failed to add winner tag");
        }
      } catch (error) {
        console.error("Error notifying winner:", error);
        alert("Failed to notify winner. Please try again.");
      }
    } else {
      alert("Please select a customer first.");
    }
  };

  const sendRefund = async () => {
    if (selectedCustomer) {
      try {
        // Step 1: Create gift card
        const createGiftCardResponse = await fetch("/api/create-gift-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: selectedCustomer.id,
            orderAmount: selectedCustomer.orderAmount,
            customerEmail: selectedCustomer.email,
          }),
        });
        const giftCardResult = await createGiftCardResponse.json();
        // console.log("Gift Card Result: ", giftCardResult);

        if (giftCardResult.success) {
          setCustomers(customers.map(c =>
            c.id === selectedCustomer.id ? { ...c, refundStatus: "Refunded" } : c
          ));
        }
        if (!giftCardResult.success) {
          throw new Error("Failed to create gift card");
        }

        // Step 2: Send notification with gift card details
        const sendNotificationResponse = await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: selectedCustomer.id,
            giftCardCode: giftCardResult.giftCard.code,
            orderAmount: selectedCustomer.orderAmount,
            customerEmail: selectedCustomer.email,
          }),
        });

        const notificationResult = await sendNotificationResponse.json();

        if (notificationResult.success) {
          setCustomers(prevCustomers => {
            const updatedCustomers = prevCustomers.map(customer =>
              customer.id === selectedCustomer.id
                ? { ...customer, refundStatus: "Refunded" }
                : customer
            );
            return sortCustomers(updatedCustomers);
          });
          alert("Refund gift card sent successfully!");
          fetchTotalGiftCardValue();
        } else {
          throw new Error("Failed to send notification");
        }
      } catch (error) {
        console.error("Error sending refund:", error);
        alert("Failed to send refund. Please try again.");
      }
    } else {
      alert("Please select a customer first.");
    }
  };
  // console.log("customers", customers);

  const renderRefund = (customer) => {
    if (customer.id === selectedCustomer?.id) {
      return <Badge tone={customer.refundStatus === "Refunded" ? "info" : "attention"} progress={customer.refundStatus === "Refunded" ? "complete" : "incomplete"}>
        {customer.refundStatus || "Not Refunded"}
      </Badge>;
    }
    return null;
  };

  const renderStatus = (customer) => {
    if (customer.id === selectedCustomer?.id) {
      return <Badge tone={customer.status === "Notified" ? "success" : "attention"} progress={customer.status === "Notified" ? "partiallyComplete" : "incomplete"}>
        {customer.status}
      </Badge>;
    }
    return null;
  };

  const renderWinner = (customer) => {
    if (customer.id === selectedCustomer?.id && customer.status === "Unnotified") {
      return <Badge tone="success">Winner</Badge>;
    }
    return customer.status === "Eligible" ?
      <Badge progress="partiallyComplete" tone="info">Eligible</Badge> :
      <span className="notEligible"><Badge tone="new">Not Eligible</Badge></span>;
  };

  const rows = customers.map((customer) => [
    customer.orderNumber,
    customer.customerName,
    `$${customer.orderAmount}`,
    customer.emailConsent === "Yes" ? <Checkbox /> : <Checkbox2 />,
    customer.smsConsent === "Yes" ? <Checkbox /> : <Checkbox2 />,
    renderWinner(customer),
    renderStatus(customer),
    renderRefund(customer)
  ]);

  const getFirstName = (customerName) => {
    const names = customerName.split(" ");
    return names[0][0];
  };

  const getLastName = (customerName) => {
    const names = customerName.split(" ");
    return names.length > 1 ? (names[names.length - 1] === "" ? names[0][1] : names[names.length - 1][0]) : names[0][1];
  };

  const initialName = selectedCustomer ? `${getFirstName(selectedCustomer.customerName)}${getLastName(selectedCustomer.customerName)}` : null;

  return (
    <AppProvider i18n={{}}>
      <DataFetcher />
      <Page title="Shopify Customer Data">
        <div className="header-content">
          <div className="hrader-info">
            <p>Commerce Pro</p>
            <a href="#">View documentation & support</a>
          </div>
          <h4>Win Your Order Back</h4>
          <p>Our app offers a seamless way to secure comprehensive email and SMS marketing consent from your customers, while promoting repeated sales without relying on sale discounts. It also streamlines winner selection and refunds, ensuring compliance and a more efficient and professional process.</p>
        </div>
        <div className="connected">
          <div className="connected-detail">
            <h5>Connected</h5>
            <p>Changes state of connection of app.</p>
          </div>
          <Card title="Gift Card Automation">
            <p>Shopify Plus stores only.</p>
            <Button>Gift Card Automation - Enabled</Button>
          </Card>
        </div>
        <div className="main-display">
          <div className="main-body-side-content">
            <h5>Set your data conditions</h5>
            <p>The date range will load in the customer orders for that date period.</p>
            <h5>Reporting Data</h5>
            <p>The Average Order Value (AOV) for that range is displayed.</p>
            <h5>Winner Selection Mode</h5>
            <p>Decide between Random and Weighted mode.</p>
            <p>Random mode = completely random selection</p>
            <p>Weighted mode = Adjust the sliding percentage that you’re willing to offer. i.e. 60% of your AOV.</p>
          </div>
          <div className="main-app-data">
            <Card>
              <div className="date-range">
                <Text variant="headingSm" as="h6">
                  Select Date Range
                </Text>
                <p>Select Customer Order Data</p>
              </div>
              <ButtonGroup>
                <span className={selectedDateRange === 'today' ? 'selected-date-range' : ''}>
                  <Button
                    onClick={() => fetchCustomers('today')}
                  >
                    Today
                  </Button>
                </span>
                <span className={selectedDateRange === 'week' ? 'selected-date-range' : ''}>
                  <Button
                    onClick={() => fetchCustomers('week')}
                  >
                    This Week
                  </Button>
                </span>
                <span className={selectedDateRange === 'month' ? 'selected-date-range' : ''}>
                  <Button
                    onClick={() => fetchCustomers('month')}
                  >
                    This Month
                  </Button>
                </span>
              </ButtonGroup>
            </Card>
            <Card title="Data Summary">
              <p className="gift-card-value">
                <span>Last Gift Card Award :</span>
                <span> ${lastGiftCardOrderValue}</span>
              </p>
              <p className="gift-card-value">
                <span>Average Order Value:</span>
                <span> ${averageOrderValue}</span>
              </p>
              <p className="gift-card-value">
                <span>Total Gift Card Value Given:</span>
                <span> ${totalGiftCardValue}</span>
              </p>
            </Card>
            <Card title="Customer Selection Settings">
              <Text variant="headingMd" as="h6">
                Winner Selection Mode
              </Text>
              <Select
                label="Selection Method"
                options={[
                  { label: 'Random', value: 'random' },
                  { label: 'Weighted', value: 'weighted' }
                ]}
                onChange={(value) => setSelectionMethod(value)}
                value={selectionMethod}
              />
              {selectionMethod === 'weighted' && (
                <RangeSlider
                  label={`Weighting Scale: ${weightedScale}%`}
                  min={0}
                  max={100}
                  value={weightedScale}
                  onChange={(value) => {
                    setWeightedScale(value);
                    updateEligibility();
                  }}
                  output
                />
              )}
            </Card>
          </div>
        </div>
        <div className="main-action-section-wrapper">
          <h4 className="winner-heading">Winner</h4>
          <div className="main-action-section">
            <Card>
              <Text variant="bodyLg" as="strong">
                {initialName ? (
                  <Avatar customer={false} size="lg" initials={initialName} />
                ) : null}
              </Text>
              <Text variant="headingSm" as="h6">
                {selectedCustomer ? selectedCustomer.customerName : null}
              </Text>
              <ButtonGroup>
                <Button onClick={selectCustomer}>Select A Winner</Button>
                <Button onClick={notifyWinner} disabled={!selectedCustomer}>
                  Notify Winner
                </Button>
                <Button onClick={sendRefund} disabled={!selectedCustomer}>
                  Send Refund
                </Button>
              </ButtonGroup>
            </Card>
            <Card>
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "numeric",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Orders",
                  "Customer",
                  "Total",
                  "Email Consent",
                  "SMS Consent",
                  "Winner",
                  "Status",
                  "Refund",
                ]}
                rows={rows}
              />
            </Card>
          </div>
        </div>
        {yes ? <>
          <div className="marketing-wrapper">
            <div className="marketing">Marketing Consent</div>
            <div className="subscribers-count-wrapper">
              <Card>
                <h4>Email Subscribers:</h4>
                <div className="subscribers-count email-ubscribers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="8" fill="#29845A" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.7803 9.96967C20.0732 10.2626 20.0732 10.7374 19.7803 11.0303L13.2803 17.5303C12.9874 17.8232 12.5126 17.8232 12.2197 17.5303L8.96967 14.2803C8.67678 13.9874 8.67678 13.5126 8.96967 13.2197C9.26256 12.9268 9.73744 12.9268 10.0303 13.2197L12.75 15.9393L18.7197 9.96967C19.0126 9.67678 19.4874 9.67678 19.7803 9.96967Z" fill="#F8FFFB" />
                  </svg>
                  <b>{`${customers.filter((customer) => customer.emailConsent === "Yes").length}`}</b>Customers
                  <b>{`${((customers.filter((customer) => customer.emailConsent === "Yes").length / customers.length) * 100).toFixed(2)}%`}</b> of your customer base
                  <div className="close-icon-wrapper">
                    <Icon source={PolarisIcons.XIcon} tone="base" />
                  </div>
                </div>
                <h4>SMS Subscribers:</h4>
                <div className="subscribers-count sms-subscribers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="8" fill="#E26C6C" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.7803 9.96967C20.0732 10.2626 20.0732 10.7374 19.7803 11.0303L13.2803 17.5303C12.9874 17.8232 12.5126 17.8232 12.2197 17.5303L8.96967 14.2803C8.67678 13.9874 8.67678 13.5126 8.96967 13.2197C9.26256 12.9268 9.73744 12.9268 10.0303 13.2197L12.75 15.9393L18.7197 9.96967C19.0126 9.67678 19.4874 9.67678 19.7803 9.96967Z" fill="#F8FFFB" />
                  </svg>
                  <b>{`${customers.filter((customer) => customer.smsConsent === "Yes").length}`}</b>Customers
                  <b>{`${((customers.filter((customer) => customer.smsConsent === "Yes").length / customers.length) * 100).toFixed(2)}%`}</b> of your customer base
                  <div className="close-icon-wrapper">
                    <Icon source={PolarisIcons.XIcon} tone="base" />
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </> : null}
      </Page>
    </AppProvider>
  );
}

function getDateRange(range) {
  const today = new Date();
  let startDate = new Date(today);
  let endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 1);

  switch (range) {
    case "today":
      startDate.setDate(today.getDate() - 1);
      break;
    case "week":
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(today.getMonth() - 10);
      break;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

export default App;