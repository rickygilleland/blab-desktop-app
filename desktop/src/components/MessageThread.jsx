import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import SendMessage from './SendMessage';
import Message from './Message';
import posthog from 'posthog-js';

class MessageThread extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            thread: {},
            recipients: [],
            recipientName: null,
            lastCopiedMessageId: null
        };

        this.initializeThread = this.initializeThread.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        this.initializeThread();
    }

    componentDidUpdate(prevProps, prevState) {
        const { match, push, messageCreating, collapsed } = this.props;
        const { thread } = this.state;

        if (prevProps.match != match && match.params.threadSlug != thread.slug || Object.keys(thread).length === 0) {
            this.initializeThread();
            this.scrollToBottom();
        }

        /*if (isEqual(this.props.messages[thread.id], prevProps.messages[thread.id]) == false) {
            this.scrollToBottom();
        }*/

        if (typeof this.props.messages[thread.id] != "undefined" && typeof prevProps.messages[thread.id] != "undefined" 
            && this.props.messages[thread.id].length != prevProps.messages[thread.id].length) {
            this.scrollToBottom();
        }
        
        if (prevProps.messageCreating != messageCreating || prevProps.collapsed != collapsed) {
            this.scrollToBottom();
        }
    }

    initializeThread() {
        const { 
            match, 
            push, 
            publicThreads, 
            privateThreads, 
            sharedThreads, 
            roomThreads, 
            getMessagesByThreadId, 
            threadType, 
            threadId 
        } = this.props;

        var curThread = null;

        if (typeof threadType != "undefined" && threadType == "room") {
            curThread = roomThreads[threadId];
        } else {
            var threadsToCheck;

            if (match.path == "/thread/public") {
                curThread = publicThreads[Object.keys(publicThreads)[0]];
            }

            if (curThread == null) {
                if (match.params.type == "private") {
                    threadsToCheck = privateThreads;
                }
        
                if (match.params.type == "public") {
                    threadsToCheck = publicThreads;
                }
        
                if (match.params.type == "shared") {
                    threadsToCheck = sharedThreads;
                }
        
                Object.keys(threadsToCheck).forEach(threadId => {
                    if (threadsToCheck[threadId].slug == match.params.threadSlug) {
                        curThread = threadsToCheck[threadId];
                    }
                })
            }
        }

        if (curThread != null) {
            getMessagesByThreadId(curThread.id);
            
            var recipients = [];
            var recipientName = '';
            curThread.users.forEach(threadUser => {
                recipients.push(threadUser.id);

                recipientName = recipientName == '' ? threadUser.first_name : recipientName + ', ' + threadUser.first_name;
            })

            this.setState({ thread: curThread, recipients, recipientName });
        }

        this.scrollToBottom();
    }

    componentWillUnmount() {
    }

    scrollToBottom() {
        if (typeof this.messagesContainer != "undefined" && this.messagesContainer != null) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 50);
        }
    }

    render() {
        const { threadLoading, settings, user, createMessage, messages, organization, messageCreating, messageLoading, collapsed, toggleThreadCollapsed } = this.props;
        const { thread, recipients, recipientName, lastCopiedMessageId } = this.state;

        var messageKeys = [];
        if (typeof messages[thread.id] != "undefined") {
            messageKeys = Object.keys(messages[thread.id]);
        }

        if (thread.type == "room" && !collapsed) {
            return(
                <center ref={(el) => { this.messagesContainer = el; }}>
                    <Button variant="dark" className="mx-auto text-center" style={{marginTop:6}} onClick={toggleThreadCollapsed}>
                        Show Chat <FontAwesomeIcon icon={collapsed ? faChevronCircleDown : faChevronCircleUp} className="ml-1" />
                    </Button>
                </center>
            )
        }

        return (
            <div className="d-flex flex-column" style={{height: thread.type === "room" ? "100%" : process.env.REACT_APP_PLATFORM === "web" ? 'calc(100vh - 30px)' : 'calc(100vh - 22px)'}}>
                {thread.type != "room" && (
                    <Row className="pl-0 ml-0 border-bottom" style={{height:80}}>
                        <Col xs={{span:8}}>
                            <div className="d-flex flex-row justify-content-start">
                                <div className="align-self-center">
                                    <p style={{fontWeight:"bolder",fontSize:"1.65rem"}} className="pb-0 mb-0">
                                        {thread.name == null && thread.type == "public" && (
                                            "Public Blabs"
                                        )}
                                        {thread.name != null && (
                                            thread.name
                                        )}
                                        {messageLoading && (
                                            <FontAwesomeIcon icon={faCircleNotch} style={{color:"#6772ef",marginLeft:10,marginTop:-2,verticalAlign:'middle',fontSize:".8rem"}} spin />
                                        )}
                                    </p>
                                </div>
                                <div style={{height:80}}></div>
                            </div>
                        </Col>
                        <Col xs={{span:4}}>
                        </Col>
                    </Row>
                )}
                {thread.type == "room" && (
                    <center>
                        <Button variant="dark" className="mx-auto text-center" style={{marginTop:6}} onClick={toggleThreadCollapsed}>
                            Hide Chat <FontAwesomeIcon icon={collapsed ? faChevronCircleDown : faChevronCircleUp} className="ml-1" />
                        </Button>
                    </center>
                )}
                {(threadLoading || messageLoading) && messageKeys.length == 0 && (
                    <div style={{marginTop: "4rem"}}>
                        <Row className="mt-3 mb-4">
                            <Col xs={{span:12}} className="text-center">
                                <h1>Loading Messages...</h1>
                                <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                            </Col>
                        </Row>
                    </div>
                )}
                <Container style={{overflowY:"scroll"}} className="mt-auto" ref={(el) => { this.messagesContainer = el; }} fluid>
                    {messageKeys.length > 0 && (
                        messageKeys.map((messageId, key)  => {
                            let message = messages[thread.id][messageId];
                            const localDate = DateTime.local();
                            let curDate = DateTime.fromISO(message.created_at);
                            let renderDateHeading = true;

                            const renderYearWithDate = curDate.startOf('year') < localDate.startOf('year');

                            if (key > 0) {
                                let prevDate = DateTime.fromISO(messages[thread.id][messageKeys[key - 1]].created_at);
                                renderDateHeading = prevDate.startOf('day') < curDate.startOf('day');
                            }

                            const renderHeading = key == 0 || key > 0 && message.user_id != messages[thread.id][messageKeys[key - 1]].user_id;
                            
                            return(
                                <div key={messageId}>
                                    {renderDateHeading && (
                                        <p className="text-center mt-2" style={{fontWeight:700}}>
                                            {renderYearWithDate ? curDate.toLocaleString(DateTime.DATE_HUGE) : curDate.toFormat('EEEE, MMMM, d')}    
                                        </p>
                                    )}
                                    <Message
                                        message={message}
                                        renderHeading={renderHeading ? true : renderDateHeading}
                                        handleCopyToClipbard={(id) => this.setState({ lastCopiedMessageId: id })}
                                        lastCopiedMessageId={lastCopiedMessageId}
                                        key={message.id}
                                    />
                                </div>
                            )
                        })
                    )}
                    {messageCreating && (
                        <p className="mx-auto text-center" style={{fontWeight:700}}>Sending Blab... <FontAwesomeIcon icon={faCircleNotch} style={{color:"#6772ef"}} spin /></p>
                    )}
                    {!threadLoading && !messageLoading && messageKeys.length == 0 && (
                        <>
                            {thread.type == "room" && (
                                <p className="text-center mx-auto" style={{fontSize:"1.5rem",fontWeight:700,marginTop:"4rem"}}>
                                    You don't have any message history in this room yet.
                                </p>
                            )}
                            {thread.type != "room" && (
                                <p className="text-center mx-auto" style={{fontSize:"1.5rem",fontWeight:700,marginTop:"4rem"}}>
                                    You don't have any message history with this person yet.
                                </p>
                            )}
                        </>
                    )}
                </Container>
                <SendMessage 
                    settings={settings} 
                    user={user} 
                    isPublic={thread.type == "public"}
                    recipients={recipients} 
                    threadId={thread.id}
                    recipientName={recipientName}
                    createMessage={createMessage} 
                    organization={organization} 
                    messageCreating={messageCreating}
                    messageCreatedStateChange={() => this.setState({ messageCreated: true })}
                />
            </div>
        )
    }

}

export default MessageThread;