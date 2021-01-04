import React, {createContext, useCallback, useContext, useEffect, useReducer} from 'react'
import defaultState from "./defaultState";
import reducer from "./reducer";
import {RootSiblingParent} from 'react-native-root-siblings';
import debounce from 'xstream/extra/debounce'
import * as Qiscus from "../services/qiscus";
import xs from "xstream";
import axios from "axios";
import * as actions from './actions';
import 'localstorage-polyfill';
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
const initialState = {...defaultState}
const WidgetContext = createContext(initialState)

export const MultichannelWidgetProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const URL_AUTH = "https://multichannel.qiscus.com/api/v1/qiscus/initiate_chat";

    let subscription = null
    let subscription2 = null
    let timeOutTyping = null

    const subscriptionMessage = useCallback(() => {
        subscription = xs.merge(Qiscus.newMessage$(), Qiscus.login$())
            .subscribe({
                next: data => {
                    getUnreadCount()
                }
            });

        subscription2 = Qiscus.typing$()
            .compose(debounce(50))
            .subscribe({
                next: data => {
                    _onTyping(data)
                }
            });
    }, []);

    const _onTyping = (status) => {
        if (timeOutTyping != null) {
            clearTimeout(timeOutTyping)
        }
        if (!state.typingStatus) dispatch(actions.setTypingStatus(true))
        timeOutTyping = setTimeout(
            () => {
                dispatch(actions.setTypingStatus(false))
            },
            5000
        );
    };

    const updateRoomInfo = roomId => new Promise((resolve, reject) => {
        Qiscus.qiscus.getRoomById(roomId)
            .then(room => {
                let subtitle = []
                let userEmail = Qiscus.qiscus.userData.email
                if (!state.isCustomAvatar) dispatch(actions.setAvatar(room.avatar))
                if (!state.isCustomSubtitle) {
                    room.participants.forEach(participant => {
                        if (userEmail === participant.email) {
                            subtitle.unshift("You")
                        } else {
                            subtitle.push(participant.username)
                        }
                    })
                    dispatch(actions.setSubtitle(subtitle.join(', ')))
                }
                resolve(room)
            })
            .catch(e => {
                reject(e)
            })
    });

    useEffect(() => {
        subscriptionMessage()
        return (() => {
            subscription?.unsubscribe()
            subscription2?.unsubscribe()
            clearTimeout(timeOutTyping)
        })
    }, [])

    //Export function
    const setup = (appId, config) => {
        Qiscus.init(appId)
        if (config?.title) {
            dispatch(actions.setTitle(config?.title))
            dispatch(actions.setIsCustomTitle(true))
            state.isCustomTitle = true
        } else {
            dispatch(actions.setTitle(defaultState.title))
            dispatch(actions.setIsCustomTitle(false))
            state.isCustomTitle = false
        }

        if (config?.subtitle) {
            dispatch(actions.setSubtitle(config?.subtitle))
            dispatch(actions.setIsCustomSubtitle(true))
            state.isCustomSubtitle = true
        } else {
            dispatch(actions.setSubtitle(defaultState.subtitle))
            dispatch(actions.setIsCustomSubtitle(false))
            state.isCustomSubtitle = false
        }

        if (config?.avatar) {
            dispatch(actions.setAvatar(config?.avatar))
            dispatch(actions.setIsCustomAvatar(true))
            state.isCustomAvatar = true
        } else {
            dispatch(actions.setAvatar(defaultState.avatar))
            dispatch(actions.setIsCustomAvatar(false))
            state.isCustomAvatar = false
        }
    }

    const getUnreadCount = () => new Promise((resolve, reject) => {
        Qiscus.qiscus.getTotalUnreadCount()
            .then(unreadCount => {
                dispatch(actions.setUnReadCount(unreadCount))
                resolve(unreadCount)
            })
            .catch(function (error) {
                // On error
                reject(error)
            })
    })

    const initiateChat = async (userId, name, deviceId) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Qiscus.qiscus.getNonce()
                    .then(async ({nonce}) => {
                        let data = JSON.stringify({
                            "app_id": Qiscus.qiscus.AppId,
                            "nonce": nonce,
                            "user_id": userId,
                            "name": name
                        });

                        let config = {
                            method: 'post',
                            url: URL_AUTH,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: data
                        };

                        return axios(config)
                    })
                    .then(function (data) {
                        const {identity_token, room_id} = data.data.data
                        dispatch(actions.setRoomId(room_id))
                        state.roomId = room_id
                        return Qiscus.qiscus.verifyIdentityToken(identity_token)
                    })
                    .then((userData) => {
                        return new Promise((resolve1) => {
                            // Set user with user data from identity token
                            Qiscus.qiscus.setUserWithIdentityToken(userData)
                            setTimeout(function () {
                                resolve1()
                            }, 1000);

                        })
                    })
                    .then(function () {
                        return Qiscus.qiscus.registerDeviceToken(deviceId)
                    })
                    .then(() => {
                        return updateRoomInfo(state.roomId)
                    })
                    .then(() => {
                        dispatch(actions.setCurrentUser(Qiscus.qiscus.userData))
                        dispatch(actions.setLoginChecked(true))
                        resolve(Qiscus.qiscus.userData)
                    })
                    .catch(error => {
                        dispatch(actions.setLoginChecked(true))
                        dispatch(actions.setLoginMessage(error.message))
                        reject(error)
                    })
            }, 1000)
        })
    }

    const currentUser = state.currentUser

    const clearUser = () => {
        dispatch(actions.resetState())
        try {
            Qiscus.qiscus.disconnect()
        }catch (e) {
        }
    }

    const removeNotification = deviceId => Qiscus.qiscus.removeDeviceToken(deviceId)

    const _store = {
        state,
        dispatch,
        getUnreadCount,
        initiateChat,
        setup,
        currentUser,
        clearUser,
        removeNotification
    };
    const store = React.useMemo(() => (_store), [state])

    return (
        <RootSiblingParent>
            <WidgetContext.Provider value={store}>
              <ActionSheetProvider>
                {props.children}
              </ActionSheetProvider>
            </WidgetContext.Provider>
        </RootSiblingParent>
    )
}

export const MultichannelWidgetConsumer = WidgetContext.Consumer

export const MultichannelWidgetContext = () => {
    const ctx = useContext(WidgetContext);
    if (ctx === undefined) {
        throw Error('MultichannelWidget can only be used within MultichannelWidgetProvider');
    }
    return ctx;
};

export default MultichannelWidgetContext