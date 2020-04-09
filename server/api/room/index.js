const router = require('express').Router();
const Room = require('../../room');
const IDGenerator = require('../../id_generator');
const RoomList = require('../../roomList');

router.post('/create', (req, res) => {
    // Check connected
    if (!req.session.user) {
        return res.status(403).send();
    }

    const settings = {
        max_player: 8,
        min_player_start: 4,
        round_duration: 45,
        round_count: 10,
    }

    try {
        const id = IDGenerator.getNewID();
        const room = new Room(id, settings);
        RoomList.addRoom(room);
        res.status(200).send({ id: id });
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).send({ message: e.message });
        } else {
            res.status(500).send({ message: 'Unknown server error.' });
        }
    }
})

module.exports = router;
