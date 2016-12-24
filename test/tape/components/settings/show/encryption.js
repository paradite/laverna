/**
 * Test components/settings/show/encryption/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import * as openpgp from 'openpgp';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/encryption/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/encryption/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/encryption/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['click #btn--privateKey'], 'showPrivateKey',
        'shows the private information if the button is clicked');
    t.equal(events['click .btn--publicKey'], 'showPublicKey',
        'shows a public information if the button is clicked');
    t.equal(events['click #btn--passphrase'], 'showPasswordView',
        'shows the password form if the button is clicked');
    t.equal(events['click .btn--add--public'], 'showAddPublicKey',
        'adds a new public key if the button is clicked');

    t.end();
});

test('settings/show/encryption/View: collectionEvents()', t => {
    const events = View.prototype.collectionEvents();
    t.equal(typeof events, 'object');
    t.equal(events.change, 'render', 're-renders the view if the collection changes');
    t.end();
});

test('settings/show/encryption/View: showPrivateKey()', t => {
    const view      = new View();
    view.privateKey = 'priv';
    sand.stub(view, 'showKey');

    view.showPrivateKey();
    t.equal(view.showKey.calledWith(view.privateKey, true), true,
        'calls "showKey" method');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showPublicKey()', t => {
    const view = new View();
    view.keys  = {fingerprint: 'pub'};
    sand.stub(view, 'showKey');
    const jq = sand.stub(view, '$').returns({attr: () => 'fingerprint'});

    view.showPublicKey({currentTarget: 'test'});
    t.equal(jq.calledWith('test'), true, 'searches for the fingerprint');
    t.equal(view.showKey.calledWith(view.keys.fingerprint), true,
        'calls "showKey" method');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showKey()', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request');
    view.collection = {get: sand.stub().withArgs('publicKeys')
    .returns({})};

    view.showKey('pub', true);
    t.equal(req.calledWithMatch('Layout', 'show', {
        region : 'modal',
        view   : {},
    }), true, 'renders the key view');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showPasswordView()', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request');
    view.collection = {get: sand.stub().withArgs('privateKey')
    .returns({})};

    view.showPasswordView();
    t.equal(req.calledWithMatch('Layout', 'show', {
        view   : {},
        region : 'modal',
    }), true, 'renders the password form view');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showAddPublicKey()', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request');
    view.collection = {get: sand.stub().withArgs('publicKeys')
    .returns({})};

    view.showAddPublicKey();
    t.equal(req.calledWithMatch('Layout', 'show', {
        view   : {},
        region : 'modal',
    }), true, 'renders public key form view');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: serializeData()', t => {
    const coll = new Configs();
    coll.resetFromObject(coll.configNames);
    const view = new View({collection: coll});

    t.deepEqual(view.serializeData(), {
        models: view.collection.getConfigs(),
        keys  : null,
    });

    const read = sand.stub(openpgp.key, 'readArmored');
    read.withArgs('priv').returns({keys: ['privTest']});
    read.withArgs('pub').returns({keys: ['pubTest']});

    const coll2 = new Configs();
    coll2.resetFromObject({privateKey: 'priv', publicKeys: {test: 'pub'}});
    view.collection = coll2;

    t.deepEqual(view.serializeData(), {
        models     : view.collection.getConfigs(),
        privateKey : 'privTest',
        keys       : {test: 'pubTest'},
    });

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: templateContext()', t => {
    const view         = new View();
    const context      = view.templateContext();
    context.privateKey = {primaryKey: {fingerprint: 'test'}};

    t.equal(context.isPrivate('test'), true,
        'returns true if the fingerprints are the same');

    t.equal(context.isPrivate('test2'), false,
        'returns false if the fingerprints are not the same');

    sand.restore();
    t.end();
});