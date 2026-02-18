// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerifier {
    struct Certificate {
        string certHash;
        address issuer;
        uint256 timestamp;
        bool revoked;
        bool exists;
    }

    mapping(string => Certificate) private certificates;
    address public owner;

    event CertificateIssued(string certHash, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(string certHash, address indexed revoker);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function issueCertificate(string memory _certHash) public {
        require(!certificates[_certHash].exists, "Certificate hash already exists");

        certificates[_certHash] = Certificate({
            certHash: _certHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            revoked: false,
            exists: true
        });

        emit CertificateIssued(_certHash, msg.sender, block.timestamp);
    }

    function verifyCertificate(string memory _certHash) public view returns (bool, address, uint256, bool) {
        require(certificates[_certHash].exists, "Certificate does not exist");
        Certificate memory cert = certificates[_certHash];
        return (cert.exists, cert.issuer, cert.timestamp, cert.revoked);
    }

    function revokeCertificate(string memory _certHash) public {
        require(certificates[_certHash].exists, "Certificate does not exist");
        require(msg.sender == certificates[_certHash].issuer || msg.sender == owner, "Not authorized to revoke");
        
        certificates[_certHash].revoked = true;
        emit CertificateRevoked(_certHash, msg.sender);
    }
}
