import React, { useState, useContext } from "react";
import styled from "styled-components";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faCode, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { AppReducerContext } from "../contexts/AppReducerContext";
import { Table, TableLabel } from "../components/tables/Tables";
import InputField from "../components/buttons/InputField";
import Modal from "../components/modals/Modal";
import { ModalContainer, ModalTopSection, ModalBottomSection, ModalTitleAndButtons } from '../components/modals/containers'
import colors from "../components/style/Colors"
import Button from "../components/buttons/Button"
import H3 from "../components/typography/H3"

const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const HtmlDiv = styled.div`
  border-color: #E92579;
  background: #E92579;
  color: white;
  justify-content: center;
  font-size: 1em;
  text-align: center;
  border: 1px solid #E6E8E9;
  border-radius: 0.25em;
  height: 46px;
  padding: 0 0.7em;
  align-items: center;
  display: flex;
`;

const InstructionDiv = styled.div`
  margin-left: 1em;
`
const WidgetContent = styled.div`
  margin-top: 3em;
`

const CodeContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
const ClipBoardIcon = styled(FontAwesomeIcon)`
  margin-left: 0.3em;
  color: white;
`

const BookingWidgetPage = () => {

  const { state } = useContext(AppReducerContext)
  const [ showInstModal, setShowInstModal ] = useState(false)

  return (
    <div>
      <Table>
        <Row>
          <HtmlDiv><FontAwesomeIcon className="fa-icons" icon={faCode} /></HtmlDiv>
          <InstructionDiv>
            <TableLabel color={colors.dark} style={{fontSize:'1em', margin: '0'}}>Setup Instructions</TableLabel>
            <TableLabel>Find instructions on how to setup your website booking widget.</TableLabel>
          </InstructionDiv>
        </Row>
        <WidgetContent>
          <Row style={{marginBottom: '1em'}}>
            <TableLabel style={{minWidth: '100px'}}>Widget ID</TableLabel>
            <InputField value={state.auth.user.uuid} disabled style={{flex: 1}} />
            <CopyToClipboard text={state.auth.user.uuid}>
              <Button primary style={{marginLeft: '1em'}}>
                Copy
                <ClipBoardIcon className="fa-icons" icon={faCopy} />
              </Button>
            </CopyToClipboard>
          </Row>
          <Row>
            <TableLabel style={{minWidth: '100px'}}>Widget</TableLabel>
            <Button primary onClick={() => setShowInstModal(true)}>
              <FontAwesomeIcon className="fa-icons" icon={faExternalLinkAlt} style={{marginRight:'0.3em'}}/>
              Booking Widget Setup Instruction
            </Button>
          </Row>
        </WidgetContent>
        <Modal
          isOpen={showInstModal}
          onClose={() => setShowInstModal(false)}
        >
          <ModalContainer>
            <ModalTopSection>
              <ModalTitleAndButtons>
                <H3>Booking Widget Setup Instruction</H3>
              </ModalTitleAndButtons>
            </ModalTopSection>
            <ModalBottomSection>
              <TableLabel style={{width: '100%', marginBottom: '1em'}}>
                1. Copy & Paste the following code below in your page.
              </TableLabel>

              <CodeContent>
                <Row>
                  <TableLabel style={{color: colors.dark}}>
                    You can add it in the HTML head section.
                  </TableLabel>
                </Row>
                <Row>
                  <InputField
                    value={`<script src="https://calendarwidget.herokuapp.com/calendarwidget.js"></script>`}
                    disabled
                    style={{flex: 1}}
                  />

                  <CopyToClipboard text={`<script src="https://calendarwidget.herokuapp.com/calendarwidget.js"></script>`}>
                    <Button primary style={{marginLeft: '1em'}}>
                      Copy
                      <ClipBoardIcon className="fa-icons" icon={faCopy} />
                    </Button>
                  </CopyToClipboard>
                </Row>
              </CodeContent>

              <TableLabel style={{width: '100%', marginTop: '2em', marginBottom: '1em'}}>
                2. Add following Markup & Script code.
              </TableLabel>
              <CodeContent>
                <Row>
                  <TableLabel style={{color: colors.dark}}>
                    Add following Markup code within the body of the page, where you want to display your calendar.
                  </TableLabel>
                </Row>
                <Row style={{marginBottom: '1em'}}>
                  <InputField
                    value={`<div id="calendar-widget" style="width: 100%; height: 100vh"></div>`}
                    disabled
                    style={{flex: 1}}
                  />
                  <CopyToClipboard text={`<div id="calendar-widget" style="width: 100%; height: 100vh"></div>`}>
                    <Button primary style={{marginLeft: '1em'}}>
                      Copy
                      <ClipBoardIcon className="fa-icons" icon={faCopy} />
                    </Button>
                  </CopyToClipboard>
                </Row>
                <Row>
                  <TableLabel style={{color: colors.dark}}>
                    Add following script code to create Calendar.
                  </TableLabel>
                </Row>
                <Row style={{marginBottom: '1em'}}>
                  <InputField
                    value={`<script>calendarWidget("${state.auth.user.uuid}")</script>`}
                    disabled
                    style={{flex: 1}}
                  />
                  <CopyToClipboard text={`<script>calendarWidget("${state.auth.user.uuid}")</script>`}>
                    <Button primary style={{marginLeft: '1em'}}>
                      Copy
                      <ClipBoardIcon className="fa-icons" icon={faCopy} />
                    </Button>
                  </CopyToClipboard>
                </Row>
              </CodeContent>
            </ModalBottomSection>
          </ModalContainer>
        </Modal>
      </Table>
    </div>
  )
}

export default BookingWidgetPage;
