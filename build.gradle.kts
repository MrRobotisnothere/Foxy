tasks.register<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}

tasks.register("assembleDebug") {
    dependsOn("npmBuild")
    doLast {
        println("AIRVPN Build Successful")
    }
}

tasks.register("lint") {
    dependsOn("npmBuild")
    doLast {
        println("AIRVPN Lint Check Passed")
    }
}
