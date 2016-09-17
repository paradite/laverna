import {Application} from 'backbone.marionette';
import {history} from 'backbone';
import Radio from 'backbone.radio';
import deb from 'debug';

import Initializer from './utils/Initializer';

const log = deb('lav:App');

/**
 * The main app (core).
 *
 * @class App
 * @extends Application
 * @license MPL-2.0
 */
export default class App extends Application {

    get channelName() {
        return 'App';
    }

    get channel() {
        return this.getChannel();
    }

    /**
     * It's called after instantiating the class.
     *
     * @fires App#init
     */
    initialize() {
        log('initialized');

        // Start listening to initialize events
        new Initializer();

        /**
         * App was initialized but hasn't started yet.
         *
         * @event App#init
         */
        this.channel.trigger('init');
    }

    /**
     * Start routers and notify other components that the app has started.
     *
     * @fires App#start
     */
    onStart() {
        log('starting the core...');
        history.start({pushStart: false});

        /**
         * App has started.
         *
         * @event App#start
         */
        this.channel.trigger('start');
    }

    /**
     * Lazy start the app.
     * Wait until other components complete their tasks, then start the app.
     * This method is used for fetching settings and doing other things
     * before starting the app.
     *
     * @listens utils/Initializer#App:core - initialize core components
     * @listens utils/Initializer#App:utils - initialize utils
     * @listens utils/Initializer#App:components - init other components
     * @returns {Promise}
     * @todo wait for initializers
     * @todo handle errors
     */
    lazyStart() {
        return Radio.request('utils/Initializer', 'start', {
            names: ['App:core', 'App:utils', 'App:components'],
        })
        .then(() => this.start())
        .catch(err => log('error', err));
    }

}