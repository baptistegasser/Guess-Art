const router = require('express').Router();
const Room = require('../../model/room');
const IDGenerator = require('../../id_generator');
const RoomHandler = require('../../model/roomHandler');

router.post('/create', (req, res) => {
    // Check connected
    if (!req.session.user) {
        return res.status(403).send();
    }

    const settings = JSON.parse(req.body.settings);

    try {
        const id = IDGenerator.getNewID();
        const room = new Room(id, settings);
        RoomHandler.addRoom(room);
        res.status(200).send({ id: id });
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).send({ message: e.message });
        } else {
            res.status(500).send({ message: 'Unknown server error.' });
        }
    }
});

router.get('/', (req, res) => {
    // Check connected
    if (!req.session.user) {
        return res.status(403).send();
    }

    res.status(200).send(RoomHandler.getAvailableRooms());
});

module.exports = router;
