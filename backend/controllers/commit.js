const fs = require('fs').promises;
const path = require('path');
const {v4:uuidv4} = require('uuid');

async function commitRepo(message){
    const repoPath = path.resolve(process.cwd(),".apnaGit");
    const stagingPath = path.join(repoPath, "staging");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitId = uuidv4();
        const commiDir = path.join(commitsPath, commitId);
        await fs.mkdir(commiDir, { recursive: true });

        const files = await fs.readdir(stagingPath);
        for(const file of files){
            await fs.copyFile(
                path.join(stagingPath, file),
                path.join(commiDir, file)
            );
        }

        await fs.writeFile(
            path.join(commiDir, "commit.json"),
            JSON.stringify({message,date: new Date().toISOString(), files})
        );
        console.log(`Commit ${commitId} created with message: "${message}"`);
    } catch (err) {
        console.log("Error committing files",err);
    }
}

module.exports = {commitRepo} 