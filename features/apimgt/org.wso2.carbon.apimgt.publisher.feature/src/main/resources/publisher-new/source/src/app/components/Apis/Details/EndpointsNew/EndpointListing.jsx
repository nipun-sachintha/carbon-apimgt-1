/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Grid,
    Button,
    Divider,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    withStyles,
    ListItemText,
    ListItemAvatar,
    Icon,
} from '@material-ui/core';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import KeyboardArrowRightRounded from '@material-ui/icons/KeyboardArrowRight';

import RemoveCircle from '@material-ui/icons/RemoveCircle';
import EndpointAdd from './EndpointAdd';
import LoadBalanceConfig from './LoadBalanceConfig';

const styles = theme => ({
    endpointInputWrapper: {
        display: 'flex',
    },
    epInput: {
        width: '100%',
    },
    listingWrapper: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    epTypeWrapper: {
        display: 'flex',
        padding: '5px',
        // justifyContent: 'space-between',
    },
    epTypeName: {
        paddingTop: '5px',
        fontWeight: 600,
    },
    epConfig: {
        justifyContent: 'flex-end',
    },
    leftArrow: {
        paddingTop: '6px',
    },
    leftArrowLight: {
        color: '#c5c5c5',
        paddingTop: '6px',
    },
    dialogHeader: {
        fontWeight: 600,
    },
    listItemOdd: {
        background: '#ececec',
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
        '&:focus': {
            backgroundColor: theme.palette.grey[400],
        },
    },
    listItem: {
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
        '&:focus': {
            backgroundColor: theme.palette.grey[400],
        },
    },
});

/**
 * The Component for endpoint listing.
 * @param {*} props The props that are being passed to the component.
 * @returns {any} The HTML view of the ep listing component.
 */
function EndpointListing(props) {
    const {
        classes,
        category,
        apiEndpoints,
        epType,
        failOvers,
        getSelectedEndpoint,
        selectedEpIndex,
        addNewEndpoint,
    } = props;
    const [endpointType, setEndpointType] = useState('http');
    const [endpoints, setEndpoints] = useState([]);
    const [isLBConfigOpen, setOpenLBConfigDialog] = useState(false);
    const selectedRef = useRef(null);

    const addEndpoint = (type) => {
        setEndpointType(type);
        // addNewEndpoint(category, type);
        setEndpoints(endpoints.concat([{ url: 'http(s)://appserver/service' }]));
    };

    const removeEndpoint = (index) => {
        const currentEndpoints = endpoints.filter((ep, id) => { return id !== index; });
        setEndpoints(currentEndpoints);
        if (currentEndpoints.length === 1) {
            setEndpointType('http');
        }
    };

    const handleEpSelect = (event, index) => {
        console.log(event.currentTarget.offset);
        getSelectedEndpoint(index, epType, category, event.currentTarget);
    };

    const getEndpointTypeSeparator = () => {
        if (endpointType === 'failover') {
            return (
                <div className={classes.epTypeWrapper}>
                    <Typography className={classes.epTypeName}>
                        <FormattedMessage
                            id='Apis.Details.EndpointsNew.EndpointListing.failovers'
                            defaultMessage='Failovers'
                        />
                    </Typography>
                </div>
            );
        }
        if (endpointType === 'load_balance') {
            return (
                <div className={classes.epTypeWrapper}>
                    <div className={classes.epTypeName}>
                        <Typography className={classes.epTypeName}>
                            <FormattedMessage
                                id='Apis.Details.EndpointsNew.EndpointListing.loadbalance'
                                defaultMessage='Loadbalance'
                            />
                        </Typography>
                    </div>
                    <div className={classes.epConfig}>
                        <Button onClick={() => setOpenLBConfigDialog(true)}>
                            <Icon>
                                settings
                            </Icon>
                        </Button>
                    </div>
                </div>);
        }
        return (
            <div />
        );
    };

    useEffect(() => {
        console.log('in use effect', apiEndpoints, category, epType);
        console.log(epType);
        setEndpointType(epType);
        setEndpoints(() => {
            if (apiEndpoints !== null && epType === 'failover') {
                return ([apiEndpoints].concat(failOvers));
            } else {
                if (apiEndpoints !== undefined) {
                    return Array.isArray(apiEndpoints) ? apiEndpoints : [apiEndpoints];
                }
                return [{ url: 'http://myservice/' }];
            }
        });
    }, [apiEndpoints, epType, failOvers]);

    console.log(
        selectedEpIndex[0], selectedEpIndex[1],
        (selectedEpIndex[0] === 0), (selectedEpIndex[1] === category), category,
    );

    console.log('endpoints: ', endpoints);

    return (
        <div className={classes.listingWrapper} ref={selectedRef}>
            <Grid container direction='column' xs={12}>
                <List>
                    <ListItem
                        id={category + '_0'}
                        button
                        onClick={event => handleEpSelect(event, 0)}
                        className={classes.listItem}
                        ref={selectedRef}
                    >
                        <ListItemText primary={endpoints.length > 0 ? endpoints[0].url : 'http://service/resource'} />
                        <ListItemSecondaryAction >
                            <KeyboardArrowRightRounded
                                className={(selectedEpIndex[0] === 0 && selectedEpIndex[1] === category) ?
                                    classes.leftArrow : classes.leftArrowLight}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <Grid xs={12}>
                    <EndpointAdd onAddEndpointClick={addEndpoint} endpointType={endpointType} />
                    {getEndpointTypeSeparator()}
                    <List>
                        {
                            (endpoints.map((ep, index) => {
                                if (index > 0) {
                                    return (
                                        <ListItem
                                            className={index % 2 === 1 ? classes.listItemOdd : classes.listItem}
                                            button
                                            id={category + '_' + index}
                                            onClick={event => handleEpSelect(event, index)}
                                        >
                                            <ListItemAvatar>
                                                <Button onClick={() => removeEndpoint(index)}>
                                                    <RemoveCircle />
                                                </Button>
                                            </ListItemAvatar>
                                            <ListItemText primary={
                                                endpoints[index] ? endpoints[index].url : 'http://service/resource'}
                                            />
                                            <ListItemSecondaryAction >
                                                <KeyboardArrowRightRounded
                                                    className={
                                                        (selectedEpIndex[0] === index &&
                                                            selectedEpIndex[1] === category) ?
                                                            classes.leftArrow : classes.leftArrowLight
                                                    }
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                }
                                return (<div />);
                            }))
                        }
                    </List>
                </Grid>
            </Grid>
            <Dialog open={isLBConfigOpen}>
                <DialogTitle>
                    <Typography className={classes.dialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.EndpointsNew.EndpointListing.loadbalance.endpoint.configuration'
                            defaultMessage='Load Balance Endpoint Configuration'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <LoadBalanceConfig />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLBConfigDialog(false)} color='primary'>
                        <FormattedMessage id='Apis.Details.EndpointsNew.EndpointListing.close' defaultMessage='Close' />
                    </Button>
                    <Button onClick={() => setOpenLBConfigDialog(false)} color='primary' autoFocus>
                        <FormattedMessage id='Apis.Details.EndpointsNew.EndpointListing.save' defaultMessage='Save' />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

EndpointListing.defaultProps = {
    selectedEpIndex: 0,
};

EndpointListing.propTypes = {
    classes: PropTypes.shape({
        epTypeWrapper: PropTypes.shape({}),
        epTypeName: PropTypes.shape({}),
        listingWrapper: PropTypes.shape({}),
        epConfig: PropTypes.shape({}),
    }).isRequired,
    epType: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    apiEndpoints: PropTypes.shape({}).isRequired,
    failOvers: PropTypes.shape({}).isRequired,
    getSelectedEndpoint: PropTypes.func.isRequired,
    selectedEpIndex: PropTypes.number,
    addNewEndpoint: PropTypes.func.isRequired,
};

export default injectIntl(withStyles(styles)(EndpointListing));
