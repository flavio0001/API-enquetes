import path from "path";

class DashboardController {
    static exibirDashboard(req, res) {
        res.sendFile(path.resolve("../front-end/dashboard.html"));
    }
}

export default DashboardController;
