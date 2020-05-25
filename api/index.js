const express = require('express');
const router = express.Router();

const Joi = require('joi');
const schema = Joi.object().keys({
    token: Joi.string().length(36).required(),
    userID: Joi.string().min(1).max(30).required(),
    itemset: Joi.array().required()
});

const admin = require('../firebase/admin');
const firestore = admin.firestore;
const uuid = require('uuid');
const apriori = require('../ml/models/apriori');

router.get('/', (req, res, next) => {
    res.json({ message: '👋 Welcome to our API! Reference: ____' });
});

router.post('/registerApp', (req, res, next) => {
    /** get a token */
    const token = uuid.v4();
    /** save token in database */
    firestore.collection('apps').doc(token).set({
        createdTimestamp: Date.now(),
        algorithm: 'APRIORI', /** KNN, best (model validation) */
        realTime: false, /** true */
        token: token
    })
    /** send message back to client */
    res.status(200);
    res.json({
        message: '🍭 Here you have your token!',
        token: token
    });
});

router.post('/items/:token', (req, res, next) => {
    /** validate */
    Object.assign(req.query, req.params);
    req.query.itemset = req.query.itemset.split(',');
    const result = Joi.validate(req.query, schema);
    if(result.error) {
        next(new Error(result.error));
        return;
    }
    /** check if app exists */
    firestore.collection('apps').doc(req.query.token).get().then(doc => {
        if(doc.exists) {
            firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID).collection('items')
                .add({
                    transaction: Date.now(),
                    action: 'basic',
                    items: req.query.itemset
                });
            firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID)
                .set({
                    lastUpdate: Date.now()
                })
        } else {
            res.status(505);
            res.json({
                status: 'error',
                error: '🔴 App does not exist!'
            });
        }
    }).catch(err => {
        next(new Error(err));
        return;
    })
});

router.post('/trainModel/:token', async (req, res, next) => {
    /** chec if app exists */
    firestore.collection('apps').doc(req.params.token).get().then((doc) => {
        if(doc.exists) {
            /** get all user data */
            const data = [];
            firestore.collection('apps').doc(req.params.token).collection('users').get()
                .then(docs => {
                    if(docs.empty) {
                        res.status(505);
                        res.json({
                            status: 'error',
                            error: '🔴 App has no users!'
                        });
                        return;
                    }
                    docs.forEach(doc => {
                        /** make request for each user */
                        firestore.collection('apps').doc(req.params.token).collection('users').doc(doc.id).collection('items').get()
                            .then(res => {
                                const userData = [];
                                res.forEach(doc => {
                                    doc.data().then(docData => {
                                        for(let i of docData.items) {
                                            if(userData.indexOf(i) === -1)
                                                userData.push(i);
                                        }
                                        userData.push(docData);
                                    })
                                });
                                data.push(userData);
                            })
                    })
                })
                .catch(err => {
                    res.status(500);
                    res.json({
                        status: 'error',
                        error: '🔴 Internal Server Error!'
                    });
                })


            res.json({ data })

            /** perform apriori */
            

            /** save model */

        } else {
            res.status(505);
            res.json({
                status: 'error',
                error: '🔴 App does not exist!'
            });
        }
    }).catch(err => {
        next(new Error(err));
        return;
    })
});

module.exports = router;

/**
 * add:
 *  - different algorithms
 *  - real time functionality (no training)
 *  - hybrid functionality (realtime and historical for faster queries)
 *  - product descriptions
 *  - user actions (different weights)
 *  - model dashboard at /:token
 */