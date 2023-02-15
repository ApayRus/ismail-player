import { findCurrentPhraseNum } from 'frazy-parser'
import { useContext, useEffect, useRef, useState } from 'react'
import { PlayerContext } from '../Player/Provider'
import { Phrase, State, Methods, PhraseTr } from './types'

export const defaultState: State = {
	currentPhraseNum: 0,
	phrases: [],
	phrasesTr: []
}

const usePhrases = () => {
	const [state, setState] = useState<State>(defaultState)

	const phraseRefs = useRef<HTMLDivElement[]>([])
	const phrasesContainerRef = useRef<HTMLIonContentElement>(null)

	const {
		state: { currentTime, playMode },
		methods: { setPlayMode },
		mediaRef
	} = useContext(PlayerContext)

	const { phrases, currentPhraseNum } = state

	useEffect(() => {
		if (playMode === 'phrase') {
			const currentPhrase = phrases[currentPhraseNum]
			const { end } = currentPhrase
			if (currentTime >= end && mediaRef.current) {
				mediaRef.current.pause()
				mediaRef.current.currentTime = end
				setPlayMode('all')
			}
		} else if (playMode === 'all') {
			const { phrases } = state
			const currentPhraseNum = findCurrentPhraseNum(phrases, currentTime)
			setState(oldState => ({ ...oldState, currentPhraseNum }))
			// scrollPhrasesBlock(currentPhraseNum, -250)
		}
	}, [currentTime, state.phrases])

	const setPhrases = (phrases: Phrase[]) => {
		setState(oldState => ({ ...oldState, phrases }))
	}

	const setPhrasesTr = (phrasesTr: PhraseTr[]) => {
		setState(oldState => ({ ...oldState, phrasesTr }))
	}

	const setCurrentPhraseNum = (currentPhraseNum: number) => {
		setState(oldState => ({ ...oldState, currentPhraseNum }))
	}

	const playPhrase = (phraseNum: number) => {
		const { phrases } = state
		const currentPhrase = phrases[phraseNum]
		const { start, id } = currentPhrase
		if (mediaRef.current) {
			setCurrentPhraseNum(+id)
			setPlayMode('phrase')
			mediaRef.current.currentTime = start
			mediaRef.current.play()
		}
	}

	const scrollPhrasesBlock = (currentPhraseNum: number, delta: number) => {
		if (currentPhraseNum <= 0 || currentPhraseNum >= phrases.length) {
			return
		}
		// const { height: videoHeight = 0 } =
		// 	stickyPlayerContainerRef.current?.getBoundingClientRect() || {}
		const currentPhraseY = phraseRefs.current[currentPhraseNum].offsetTop
		phrasesContainerRef?.current?.scrollToPoint(
			null,
			currentPhraseY + delta, // - videoHeight
			1000
		)
	}

	const methods: Methods = {
		setPhrases,
		setPhrasesTr,
		playPhrase,
		scrollPhrasesBlock
	}

	return { state, methods, phraseRefs, phrasesContainerRef }
}

export default usePhrases
