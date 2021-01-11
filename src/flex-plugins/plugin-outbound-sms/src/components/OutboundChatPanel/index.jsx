import React from 'react';
import { request } from '../../helpers/request';
import { withStyles } from '@material-ui/core/styles';
import sharedTheme from '../../styling/theme';
import { TextField, Button, Icon } from '@material-ui/core';
import * as Flex from "@twilio/flex-ui";

const styles = theme => (sharedTheme(theme));

class OutboundChatPanel extends React.Component {

    state = {
        customerNumber: "",
        message: "",
    }

    componentDidMount() {

       Flex.Manager.getInstance().workerClient.on("reservationCreated", function (reservation){

            const { task: { taskChannelUniqueName, attributes: { direction }}} = reservation;

            if(taskChannelUniqueName === 'sms' && direction === 'outbound' && this.state.message !== ""){

                this.setState({ message: "" });

            }

       }.bind(this));


    }

    initChat = async () => {
        if(this.state.customerNumber !== "") {
        
            this.setState({ 
                customerNumber: "",
                message: "Loading..." 
            });

            await request("initiate-outbound-sms", this.props.manager, {
                customerNumber: this.state.customerNumber
            });


            setTimeout(function (){
                if(this.state.message !== "") {
                    this.setState({ 
                        message: "Something went wrong, please try again. "
                    })
                }
            }.bind(this), 5000);

        }
    }

    render() {

        const { classes } = this.props;

        return (
            <div className={classes.boxDialpad}>
                <div className={classes.titleAgentDialpad}>Outbound SMS</div>
                <TextField 
                    id="standard-basic" 
                    label="Enter a number" 
                    value={this.state.customerNumber}
                    onChange={(event) => this.setState({ customerNumber: event.target.value })}
                />
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Icon>send</Icon>}
                    onClick={this.initChat}
                >
                    Start
                </Button>
                {this.state.message}
            </div>
        )

    }
}

export default withStyles(styles)(OutboundChatPanel);