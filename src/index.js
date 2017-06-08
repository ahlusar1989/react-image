import React, { Component } from 'react';
import { node, oneOfType, string, array } from 'prop-types';
import LRUCache from './LRUCache';

// instantiate LRU Cache constructor
const cache = new LRUCache(10);
export default class Img extends Component {

	static propTypes = {
		loader: node,
		unloader: node,
		src: oneOfType([string, array])
	}

	static defaultProps = {
		loader: false,
		unloader: false,
		src: []
	}

	constructor(props) {
		super(props);

		// create image list
		this.imageList = this.imageSourcesToArray(this.props.src);
		// add images to Map k, v --> index, element
		this.imageList.forEach((element, index) => cache.set(index, element));
		// check cache to decide at which index to start
		for (let i = 0; i < this.imageList.length; i++) {
			// check for Error object ---> if it is apparent set state to Loaded
			//just load it if it is not in there - this means the first time it is used
			if ((cache.get(i) instanceof Error)) {
				break;
			}
			else if (cache.get(i) === true) {
				this.state = { currentIndex: i, isLoading: false, isLoaded: true };
				return true;
			}
		}
		this.state = this.imageList.length
			? // original operation: start at 0 and try to load
			{ currentIndex: 0, isLoading: true, isLoaded: false }
			: // if we dont have any sources, jump directly to loading state
			// ---> see render call below
			{ isLoading: false, isLoaded: false };

			this.onLoad = this.onLoad.bind(this);
			this.onError = this.onError.bind(this);
	}

	//image src uri to array --> call in constructor in order to add images to LRU cache
	imageSourcesToArray(src) {
		return (Array.isArray(src) ? src : [src]).filter(x => x);
	}

	onLoad() {
		// set that image in question to true
		cache.set(this.state.currentIndex, true);
		if (this.i) {
			this.setState({ isLoaded: true })
		};
	}

	onError() {
		let size = this.imageList.length;
		cache.set(this.state.currentIndex, false);
		// cache.set(this.state.currentIndex + 1, true);
		// remove that item in question
		//image probably at this point has not mounted - do nothing and return false
		if (!this.i) {
			return false;
		};
		// before loading the next image, check to see if it was ever loaded in the past
		for (let nextIndex = this.state.currentIndex + 1; nextIndex < size; nextIndex++ ){
			// get next image
			let src = this.imageList[nextIndex];
			// since we just set the new image in the cache it has to be an  
			// image that we have never seen - load it
			if ((cache.get(nextIndex)) === src) {
				console.log("here in src")
				this.setState({ currentIndex: nextIndex });
				break;
			}

			// this can only occur if we have seen this before
			// use this next item
			else if(cache.get(nextIndex) === true || (cache.get(nextIndex) == src)){
				console.log("in true")
				this.setState({
					currentIndex: nextIndex, 
					isLoading: false, 
					isLoaded: true
				})
				console.log(this.state)
				return true;
			}

			// if it doesn't just skip it 
			if (cache.get(nextIndex) === false) {
				"in false"
				continue;
			}
			// currentIndex is zero bases, length is 1 based.
			// if we have no more sources to try, return - we are done
			if (nextIndex === size) {
				console.log("here in size check")
				return this.setState({isLoading: false})
			}
		}
		// this.loadImage();
	}

	loadImage() {
		this.i = new Image();
		this.i.src = this.imageList[this.state.currentIndex];
		this.i.onload = this.onLoad;
		this.i.onerror = this.onError;
	}

	removeImage() {
		delete this.i.onerror;
		delete this.i.onload;
		delete this.i.src;
		delete this.i;
	}

	componentDidMount() {
		if (this.state.isLoading) {
			this.loadImage()
		};
	}

	componentWillUnmount() {
		//cleanup any listeners
		if (this.i) {
			this.removeImage();
		}
	}
	componentWillReceiveProps (nextProps) {
		let src = this.imageSourcesToArray(nextProps.src);

		let srcAdded = src.filter(s => this.imageList.indexOf(s) === -1);
		let srcRemoved = this.imageList.filter(s => src.indexOf(s) === -1);
		// if the source prop changed, restart the loading process
		// if src prop changed, restart the loading process
		if (srcAdded.length || srcRemoved.length) {
			this.imageList = src
			// if we dont have any sources, jump directly to unloader
			if (!src.length) {
				return this.setState({isLoading: false, isLoaded: false})
			}
			this.setState({currentIndex: 0, isLoading: true, isLoaded: false}, this.loadImage)
		}
	}

	render() {
		// if we have loaded, show the image
		if (this.state.isLoaded) {
		// clear non image props
			let { src, unloader, loader, ...rest } = this.props; //eslint-disable-line
			return <img src={this.imageList[this.state.currentIndex]} {...rest} />;
		}

		// if we are still trying to load, show image and a backup component if requested
		if (!this.state.isLoaded && this.state.isLoading) {
			return this.props.loader ? this.props.loader : null;
		}
		// if we have given up on loading, show a place holder, or nothing
		if (!this.state.isLoaded && !this.state.isLoading) {
			return this.props.unloader
				? this.props.unloader
				: null;
			}
		}
	}