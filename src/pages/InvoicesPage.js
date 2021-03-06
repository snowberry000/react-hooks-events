import React, {useState, useContext, useEffect} from "react";
import Modal from "../components/modals/Modal";
import {
  ModalContainer,
  ModalTopSection,
  ModalBottomSection,
  ModalTitleAndButtons
} from "../components/modals/containers";

import { Table, TableValue } from "../components/tables/Tables";
import AddGlyph from "../images/Glyphs/AddGlyph";
import SvgButton from "../components/buttons/SvgButton";
import colors from "../components/style/Colors";
import viewGlyph from "../images/Glyphs/view.svg";
import Button from "../components/buttons/Button";
import DropdownMenu from "../components/buttons/DropdownMenu";
import { AppReducerContext } from "../contexts/AppReducerContext";
import P1 from "../components/typography/P1";
import BigTabbedFilter from "../components/features/BigTabbedFilter";
import { formatEventDate } from "../utils/dateFormatting";
import { formatCurrency } from "../utils/numbers";
import PickerButton from "../components/buttons/PickerButton";
import InvoiceDetail from "../components/features/invoices/invoiceDetail";
import { invoiceStates, invoiceStatesColors } from "../models/invoices";
import SearchField from "../components/inputs/searchField";
import { css } from "emotion";
import SelectBookingModal from "../components/features/invoices/selectBooking";
import NewInvoice from "../components/features/invoices/newInvoice";
import SpinnerContainer from "../components/layout/Spinner";
import H3 from "../components/typography/H3";
import StripeApp from "../components/stripe/StripeApp";

import {
  DELETE_BOOKING_INVOICE_ERROR, DELETE_BOOKING_INVOICE_SUCCESS,
  GET_BOOKING_BOOKINGSTATUS_SUCCESS,
  GET_BOOKING_INVOICE_SUCCESS,
  GET_BOOKINGS_SUCCESS,
  GET_CUSTOMERS_SUCCESS, REQUEST_DELETE_BOOKING_INVOICE,
  REQUEST_UPDATE_BOOKING_INVOICE,
  UPDATE_BOOKING_INVOICE_ERROR, UPDATE_BOOKING_INVOICE_SUCCESS,
  REQUEST_CREATE_BOOKING_INVOICE, GET_CREATE_BOOKING_INVOICE_SUCCESS, GET_CREATE_BOOKING_INVOICE_ERROR,
  UPDATE_INVOICE_STATUS,
  REQUEST_DELETE_INVOICE
} from "../reducers/actionType";
import axios from "axios/index";

const InvoicesPage = () => {
  const [selectedInvoiceCoordinates, setSelectedInvoiceCoordinates] = useState(
    null
    // { booking: "99af5d47-3837-4623-be55-f85c0b511c0f", index: 0 }
  ); // booking id + index of the invoice

  const [showSelectBookingModal, setshowSelectBookingModal] = useState(
    false
    // true
  );
  const [
    selectedBookingIdForNewInvoice,
    setSelectedBookingIdForNewInvoice
  ] = useState(null);
  const [showCreateInvoiceModal, setshowCreateInvoiceModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { state, dispatch } = useContext(AppReducerContext);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const [showCreditCardInfoModal, setShowCreditCardInfoModal] = useState(false);
  const [selectedChargeData, setSelectedChargeData] = useState({});

  useEffect(() => {

    setLoading(true);
    axios.all([
      axios.get('/customers'),
      axios.get('/statuses'),
      axios.get('/bookings'),
      axios.get(`/bookings/invoices/all`)
    ]).then(axios.spread(function (customers, statuses, bookings, invoices) {
      dispatch({
        type: GET_CUSTOMERS_SUCCESS,
        payload: customers.data.customers
      })

      dispatch({
        type: GET_BOOKING_BOOKINGSTATUS_SUCCESS,
        payload: statuses.data.statuses
      })

      dispatch({
        type: GET_BOOKINGS_SUCCESS,
        payload: bookings.data.bookings
      })

      dispatch({
        type: GET_BOOKING_INVOICE_SUCCESS,
        payload: invoices.data.invoices,
      })
      setLoading(false);
    }))
    .catch(error => console.log(error));
  }, [])

  const handleUpdate = async (invoice, isSave,statusValue) => {
    if (isSave) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };

        dispatch({ type: REQUEST_UPDATE_BOOKING_INVOICE })

        const res = await axios.put(
          `/bookings/${invoice.BookingId}/invoices/${invoice.id}`,
          {
            slots: JSON.stringify(invoice.slots),
            cost_items: JSON.stringify(invoice.costItems),
            value: invoice.value,
            payment_method: invoice.payment_method,
            discount: invoice.discount,
            customerId: invoice.customerId? invoice.customerId : invoice.booking.customerId,
            sub_total: invoice.amount,
            // tax: saveOne.amount,
            grand_total: invoice.grand_total,
            status: statusValue || invoice.status,
          },
          config
        )

        dispatch({
          type: UPDATE_BOOKING_INVOICE_SUCCESS,
          payload: res.data.invoice
        })

        if (invoice.payment_method === 'Credit Card' && state.auth.user.stripe_public_key && state.auth.user.stripe_public_key.length) {
          setSelectedChargeData({
            amount: Number(invoice.sub_total.toFixed(2)) * 100,
            currency: state.settings.companyInfo.currency.length ? state.settings.companyInfo.currency : "USD",
            id: invoice.id,
            bookingId: invoice.BookingId,
          })
          setShowCreditCardInfoModal(true);
        } else if (invoice.payment_method === 'Online Payment') {
          await axios.post(
            '/bookings/transferFunds',
            {
              amount: Number(invoice.sub_total.toFixed(2)) * 100,
              currency: state.settings.companyInfo.currency.length ? state.settings.companyInfo.currency : "USD",
              id: invoice.id,
            }
          ).then(async (res) => {
            if (res.data.success) {
              dispatch({ type: REQUEST_UPDATE_BOOKING_INVOICE })

              const resOne = await axios.put(
                `/bookings/${invoice.BookingId}/invoices/${invoice.id}`,
                {
                  slots: JSON.stringify(invoice.slots),
                  cost_items: JSON.stringify(invoice.costItems),
                  value: invoice.value,
                  payment_method: invoice.payment_method,
                  discount: invoice.discount,
                  customerId: invoice.customerId? invoice.customerId : invoice.booking.customerId,
                  sub_total: invoice.sub_total,
                  // tax: saveOne.amount,
                  grand_total: invoice.grand_total,
                  status: "Paid",
                },
                config
              )
              dispatch({
                type: UPDATE_BOOKING_INVOICE_SUCCESS,
                payload: resOne.data.invoice
              })
            }
          });
        }

      } catch (err) {
        dispatch({ type: UPDATE_BOOKING_INVOICE_ERROR });
      }
    }

    setshowCreateInvoiceModal(false);
  }

  const handleCreate = async(isSave, invoice) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const saveOne = {...invoice};

      dispatch({ type: REQUEST_CREATE_BOOKING_INVOICE })

      const res = await axios.post(
        `/bookings/${saveOne.booking.id}/invoices`,
        {
          slots: JSON.stringify(saveOne.slots),
          cost_items: JSON.stringify(saveOne.costItems),
          value: saveOne.value,
          payment_method: saveOne.payment_method,
          discount: saveOne.discount,
          customerId: saveOne.booking.customerId,
          createdAt: saveOne.createdAtAt,
          sub_total: saveOne.amount,
          // tax: saveOne.amount,
          grand_total: saveOne.grand_total,
          status: saveOne.status,
        },
        config
      )

      dispatch({
        type: GET_CREATE_BOOKING_INVOICE_SUCCESS,
        payload: res.data.invoice
      })

      if (invoice.payment_method === 'Credit Card' &&
        state.auth.user.stripe_public_key &&
        state.auth.user.stripe_public_key.length > 0
      ) {
        setSelectedChargeData({
          amount: Number(saveOne.amount.toFixed(2)) * 100,
          currency: state.settings.companyInfo.currency.length ? state.settings.companyInfo.currency : "USD",
          id: res.data.invoice.id,
          bookingId: saveOne.booking.id,
        })
        setShowCreditCardInfoModal(true);
      } else if (saveOne.payment_method === 'Online Payment' && state.auth.user.stripe_status !== 0) {
        const resPay = await axios.post(
          '/bookings/transferFunds',
          {
            amount: Number(saveOne.amount.toFixed(2)) * 100,
            currency: state.settings.companyInfo.currency.length ? state.settings.companyInfo.currency : "USD",
            id: res.data.invoice.id,
            bookingId: saveOne.booking.id,
          }
        )

        if (resPay.data.success) {
          dispatch({ type: REQUEST_UPDATE_BOOKING_INVOICE })

          const resOne = await axios.put(
            `/bookings/${saveOne.booking.id}/invoices/${res.data.invoice.id}`,
            {
              slots: JSON.stringify(saveOne.slots),
              cost_items: JSON.stringify(saveOne.costItems),
              value: saveOne.value,
              payment_method: saveOne.payment_method,
              discount: saveOne.discount,
              customerId: saveOne.booking.customerId,
              createdAt: saveOne.createdAtAt,
              sub_total: saveOne.amount,
              // tax: saveOne.amount,
              grand_total: saveOne.grand_total,
              status: 'Paid',
            },
            config
          )

          dispatch({
            type: UPDATE_BOOKING_INVOICE_SUCCESS,
            payload: resOne.data.invoice
          })
        }
      }

    } catch (err) {
      dispatch({ type: GET_CREATE_BOOKING_INVOICE_ERROR });
    }

    setshowCreateInvoiceModal(false);
  }

  const handleDelete = async (invoice) => {

    try {
      dispatch({ type: REQUEST_DELETE_BOOKING_INVOICE });

      await axios.delete(`/bookings/${invoice.BookingId}/invoices/${invoice.id}`);

      dispatch({
        type: DELETE_BOOKING_INVOICE_SUCCESS,
        payload: invoice.id,
      })
    } catch (err) {
      dispatch({ type: DELETE_BOOKING_INVOICE_ERROR })
    }
  }

  const getBookingNameWithId = (bookingId) => {
    const filteredOne = state.bookings.bookings.filter(item => item.id === parseInt(bookingId));
    if (filteredOne.length > 0)
      return filteredOne[0].eventName;
    else return "";
  }

  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    const newInvoices = state.bookings.invoices
      .filter(invoice => invoice !== null)
      .flat()
      .filter(invoice => {
        const customerName =  (invoice.customerId && state.customers.customers && state.customers.customers.find(c => c.id === invoice.customerId) &&
          state.customers.customers.find(c => c.id === invoice.customerId).name) || "N/A";
        const bookingName =  (invoice.BookingId && state.bookings.bookings && state.bookings.bookings.find(c => c.id === invoice.BookingId) &&
          state.bookings.bookings.find(c => c.id === invoice.BookingId).eventName) || "N/A"
        return (
          (invoice.status === selectedFilter || selectedFilter === "All") && // apply filters
          (!searchQuery ||
            (invoice.number && invoice.number.toString() === searchQuery) ||
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.booking && invoice.booking.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        );
      })
      .sort((inv1, inv2) => (inv1.created > inv2.created ? -1 : 1));
      setInvoices([...newInvoices]);
  }, [state.bookings.invoices, searchQuery, selectedFilter])

  const hideCreditModal = async () => {
    dispatch({ type: REQUEST_UPDATE_BOOKING_INVOICE })
    try {
      const res = await axios.put(
        `/bookings/${selectedChargeData.bookingId}/invoices/${selectedChargeData.id}`,
        {status: "Paid"}
      )

      dispatch({
        type: UPDATE_BOOKING_INVOICE_SUCCESS,
        payload: res.data.invoice,
      })
    } catch (err) {
      dispatch({ type: UPDATE_BOOKING_INVOICE_ERROR })
    }
    setShowCreditCardInfoModal(false)
  }

  return (
    <>
      <SpinnerContainer loading={(loading || state.bookings.loadingInvoice).toString()} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: 'space-between',
          marginBottom: '1em',
        }}  
      >
        <h1>Invoices</h1>
        <Button
          primary
          iconComponent={() => <AddGlyph fill={colors.white} />}
          onClick={() => setshowSelectBookingModal(true)}
        >
          Add Invoice
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40
        }}
      >        
        <SearchField
          query={searchQuery}
          placeholder={"Search Invoices"}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <BigTabbedFilter
          items={invoiceStates}
          colors={invoiceStatesColors}
          selectedItem={selectedFilter}
          onSelect={setSelectedFilter}
          style={{
            marginBottom: 0,
            marginTop: 0,
            maxWidth: 350,
            height: 40
          }}
        />
      </div>

      {!loading && invoices && invoices.length > 0 && (
        <Table
          columns="50px auto auto auto auto 150px 50px 50px"
          columnTitles={[
            "#",
            "Created",
            "Customer",
            "Booking",
            "Amount",
            "Status",
            "",
            ""
          ]}
        >
          {invoices.map((invoice, index) => {
            return (
              <React.Fragment key={index}>
                {/* number */}
                <TableValue>{invoice.number || (index + 1)}</TableValue>
                {/* created */}
                <TableValue>{formatEventDate(invoice.created)}</TableValue>
                {/* customer */}
                <TableValue>
                  {
                    (invoice.customerId && state.customers.customers && state.customers.customers.find(c => c.id === invoice.customerId) &&
                    state.customers.customers.find(c => c.id === invoice.customerId).name) || "N/A"
                  }
                </TableValue>
                {/* booking */}
                <TableValue>
                  {getBookingNameWithId(invoice.BookingId)}
                </TableValue>
                {/* amount */}
                <TableValue>
                  {formatCurrency(invoice.grand_total || 0, state.settings.companyInfo.currency)}
                </TableValue>
                {/* status */}
                <PickerButton
                  options={invoiceStates}
                  colors={invoiceStatesColors}
                  selectedOption={invoice.status}
                  onOptionSelected={status => {
                    // dispatch({
                    //   type: UPDATE_INVOICE_STATUS,
                    //   ...invoice.coordinates,
                    //   index: index,
                    //   status: status
                    // });
                    handleUpdate(invoice, true, status)
                  }}
                />
                {/* actions */}
                <SvgButton
                  width={24}
                  height={24}
                  svg={viewGlyph}
                  onClick={() => {
                    setSelectedInvoiceCoordinates({
                      booking: invoice.BookingId,
                      index: index
                    })
                  }}
                />
                <DropdownMenu
                  items={["Delete"]}
                  colors={["#D13636"]}
                  onItemSelected={item => {
                    handleDelete(invoice)
                    // dispatch({
                    //   type: REQUEST_DELETE_INVOICE,
                    //   ...invoice.coordinates,
                    //   invoice: item.id,
                    //   index: index
                    // });
                  }}
                />
              </React.Fragment>
            );
          })}
        </Table>
      )}

      {invoices.length === 0 && (
        <P1>
          There are no matching invoices.{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              setSelectedFilter("All");
              setSearchQuery("");
            }}
          >
            View All
          </span>
        </P1>
      )}

      <Modal
        isOpen={selectedInvoiceCoordinates !== null}
        onClose={() => setSelectedInvoiceCoordinates(null)}
      >
        <InvoiceDetail
          invoice={selectedInvoiceCoordinates}
          handleUpdate={handleUpdate}
        />
      </Modal>
      <Modal
        isOpen={showSelectBookingModal}
        onClose={() => setshowSelectBookingModal(false)}
        width="30em"
      >
        <SelectBookingModal
          onSelectBooking={bookingId => {
            setSelectedBookingIdForNewInvoice(bookingId);
            setshowSelectBookingModal(false);
            setshowCreateInvoiceModal(true);
          }}
        />
      </Modal>
      <Modal
        isOpen={showCreateInvoiceModal}
        onClose={() => setshowCreateInvoiceModal(false)}
      >
        <NewInvoice
          invoiceNumber={invoices.length + 1}
          booking={state.bookings.bookings.find(
            b => b.id === selectedBookingIdForNewInvoice
          )}
          // onEndEditing={() => {
          //   setshowCreateInvoiceModal(false);
          // }}
          onEndEditing={handleCreate}
        />
      </Modal>

      {
        (state.auth.user.stripe_public_key && state.auth.user.stripe_public_key.length > 0) && (
          <Modal
            isOpen={showCreditCardInfoModal}
            onClose={() => setShowCreditCardInfoModal(false)}
          >
            <ModalContainer>
              <ModalTopSection>
                <ModalTitleAndButtons>
                  <H3>Credit Card Info</H3>
                  <Button
                    primary
                    style={{ marginRight: 10 }}
                    onClick={() => setShowCreditCardInfoModal(false)}
                  >
                    Close
                  </Button>
                </ModalTitleAndButtons>

              </ModalTopSection>

              <ModalBottomSection>
                <StripeApp
                  stripe_pk_key={state.auth.user.stripe_public_key}
                  chargeData={selectedChargeData}
                  closeModal={hideCreditModal}
                />
              </ModalBottomSection>
            </ModalContainer>
          </Modal>
        )
      }
    </>
  );
};

export default InvoicesPage;
