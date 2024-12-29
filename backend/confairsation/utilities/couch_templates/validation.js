const validate = function (newDoc, oldDoc, userCtx) {

	function unchanged(field) {
		if (!oldDoc) {return }
		if (toJSON(oldDoc[field]) !== toJSON(newDoc[field])) {
			throw ({forbidden: "cannot change field: " + field})
		}
	}

	function required(field, v) {
		if (!(v || newDoc[field])) {
			throw ({forbidden: "required field: " + field})
		}
	}

	function iso8601(field, v) {
		if (!/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/.test(v || newDoc[field])) {
			throw ({forbidden: "invalid ISO 8601 timestamp: " + field})
		}
	}

	function hexColor(field, v) {
		if (!/^[0-9A-Fa-f]{6}$/.test(v || newDoc[field])) {
			throw ({forbidden: "invalid hex color: " + field})
		}
	}

	function length(field, min, max, v) {
		const l = (v || newDoc[field] || "").length
		if (l < min) {
			throw ({forbidden: "too short: " + field})
		}

		if (l > max) {
			throw ({forbidden: "too long: " + field})
		}
	}

	function string(field, v) {
		if (typeof (v || newDoc[field]) !== "string") {
			throw ({forbidden: "string expected: " + field})
		}
	}

	function stringOrNull(field, v) {
		const w = (v || newDoc[field])

		if (w !== null && w !== undefined && typeof w !== "string") {
			throw ({forbidden: "string or null expected " + field + ': got "' + w + '"'})
		}
	}

	function validKeys(keys, doc) {
		for (const key of Object.keys(doc || newDoc)) {
			if (keys.indexOf(key) === -1) {
				throw ({forbidden: "invalid key: " + key})
			}
		}
	}

	function validValue(field, values, v) {
		const w = (v || newDoc[field])

		if (values.indexOf(w) === -1) {
			throw ({forbidden: "unexpected value for '" + field + "': got '" + w + "' but expected one of " + values + " (" + values.length + " possibilities total)"})
		}
	}

	function validateEach(arr, fn) {
		if (!Array.isArray(arr)) {
			throw ({forbidden: "expected an array"})
		}

		for (const v of arr) {
			fn(v)
		}
	}

	function validateParticipant(participant) {
		required('participant', participant)
		string('participant', participant)
		length('participant', 0, 32, participant)
	}

	function validateEvent(event) {
		validKeys(['timestamp', 'subject', 'type'], event)

		required('timestamp', event.timestamp)
		string('timestamp', event.timestamp)
		iso8601('timestamp', event.timestamp)

		stringOrNull('subject', event.subject)
		length('subject', 0, 32, event.subject)

		required('type', event.type)
		string('type', event.type)
		validValue('type', ["joined", "left", "speaking", "interrupted"], event.type)
	}

	function validateConversation() {
		validKeys(["_id", "_rev", "_revisions", "_deleted", "type", "title", "date", "participants", "events"])

		required("title")
		string("title")
		length("title", 0, 255)

		required("date")
		unchanged("date")
		string("date")
		iso8601("date")

		required("participants")
		length("participants", 0, 1000)
		validateEach(newDoc.participants, validateParticipant)

		required("events")
		length("events", 0, 100000)
		validateEach(newDoc.events, validateEvent)
	}

	function validateSingleList(field, fn, v, ...args) {
		const w = (v || newDoc(field))
		if (!Array.isArray(w)) {
			throw ({forbidden: "Expected list: " + field})
		}

		if (w.length > 1) {
			throw ({forbidden: "Expected zero or one elements: " + field})
		}

		if (w.length === 1) {
			fn(field, ...args, w[0])
		}
	}

	function validateAvatar(avatar) {
		validKeys([
			"accessories", "accessoriesColor", "accessoriesProbability",
			"backgroundColor", "clothing", "clothesColor", "eyebrows", "eyes",
			"facialHair", "facialHairColor", "facialHairProbability",
			"hairColor", "hatColor", "mouth", "skinColor", "top", "topProbability"
		], avatar)

		validateSingleList("accessories", validValue, avatar.accessories, ["eyepatch", "prescription01", "prescription02", "round", "sunglasses", "wayfarers", "kurt"])
		validateSingleList("accessoriesColor", hexColor, avatar.accessoriesColor)
		validValue("accessoriesProbability", [100], avatar.accessoriesProbability)
		validateSingleList("backgroundColor", hexColor, avatar.backgroundColor)
		validateSingleList("clothing", validValue, avatar.clothing, ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"])
		validateSingleList("clothesColor", hexColor, avatar.clothesColor)
		validateSingleList("eyebrows", validValue, avatar.eyebrows, ["angryNatural", "defaultNatural", "flatNatural", "frownNatural", "raisedExcitedNatural", "sadConcernedNatural", "upDownNatural"])
		validateSingleList("eyes", validValue, avatar.eyes, ["closed", "cry", "default", "xDizzy", "happy", "eyeRoll", "side", "squint", "surprised", "wink", "winkWacky"])
		validateSingleList("hairColor", hexColor, avatar.hairColor)
		validateSingleList("hatColor", hexColor, avatar.hatColor)
		validateSingleList("facialHair", validValue, avatar.facialHair, ["beardLight", "beardMajestic", "beardMedium", "moustacheFancy", "moustacheMagnum"])
		validateSingleList("facialHairColor", hexColor, avatar.facialHairColor)
		validValue("facialHairProbability", [100], avatar.facialHairProbability)
		validateSingleList("mouth", validValue, avatar.mouth, ["concerned", "default", "eating", "grimace", "sad", "screamOpen", "serious", "twinkle", "smile", "tongue"])
		validateSingleList("skinColor", hexColor, avatar.skinColor)
		validateSingleList("top", validValue, avatar.top, ["bigHair", "bob", "bun", "curly", "curvy", "dreads", "dreads01", "dreads02", "frida", "frizzle", "fro", "froBand", "hat", "hijab", "longButNotTooLong", "miaWallace", "shaggy", "shaggyMullet", "shavedSides", "shortCurly", "shortFlat", "shortRound", "shortWaved", "sides", "straight01", "straight02", "straightAndStrand", "theCaesar", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04"])
		validValue("topProbability", [100], avatar.topProbability)
	}

	function validatePerson() {
		validKeys(["_id", "_rev", "_revisions", "_deleted", "type", "name", "avatar"])

		required("name")
		string("name")
		length("name", 0, 100)

		required("avatar")
		validateAvatar(newDoc.avatar)
	}

	if (newDoc.type === "conversation") {
		validateConversation()
	} else if (newDoc.type === "person") {
		validatePerson()
	} else {
		throw ({forbidden: "invalid document type: " + newDoc.type})
	}
}
